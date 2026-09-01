import Foundation
import UserNotifications
import UIKit

final class NotificationCoordinator {
    static let shared = NotificationCoordinator()
    private let defaults = UserDefaults.standard
    private let configKey = "nexora_notification_config"
    private let seenKey = "nexora_seen_bank_keys"
    private let seededKey = "nexora_bank_seeded"
    private let reminderKey = "nexora_reminder_keys"
    private let reminderSignatureKey = "nexora_reminder_signature"

    private init() {}

    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

    func updateConfig(json: String) {
        defaults.set(json, forKey: configKey)
        let signature = reminderSignature(json: json)
        if defaults.string(forKey: reminderSignatureKey) == signature { return }
        defaults.set(signature, forKey: reminderSignatureKey)
        scheduleLocalReminders()
    }

    private func reminderSignature(json: String) -> String {
        guard let data = json.data(using: .utf8),
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return json }
        let relevant: [String: Any] = [
            "language": object["language"] ?? "et",
            "notifications": object["notifications"] ?? [:],
            "tasks": object["tasks"] ?? [],
            "bills": object["bills"] ?? [],
            "vehicles": object["vehicles"] ?? [],
            "budget": object["budget"] ?? [:]
        ]
        guard let out = try? JSONSerialization.data(withJSONObject: relevant, options: [.sortedKeys]) else { return json }
        return String(data: out, encoding: .utf8) ?? json
    }

    func performBackgroundSync(completion: @escaping (UIBackgroundFetchResult) -> Void) {
        guard let config = configObject(),
              let bank = config["bank"] as? [String: Any],
              let api = config["bankApiUrl"] as? String,
              !api.isEmpty,
              let install = bank["installId"] as? String,
              let handle = bank["handle"] as? String,
              !install.isEmpty, !handle.isEmpty else {
            completion(.noData)
            return
        }

        guard let url = URL(string: api.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + "/api/sync") else {
            completion(.failed); return
        }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 25
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Nexora iOS Background Sync", forHTTPHeaderField: "User-Agent")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["install_id": install, "bank_handle": handle])

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let self else { completion(.failed); return }
            guard error == nil, let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode), let data else {
                completion(.failed); return
            }
            guard let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  (object["connected"] as? Bool) == true else {
                completion(.noData); return
            }
            let hadNew = self.processBankResponse(object, config: config)
            completion(hadNew ? .newData : .noData)
        }.resume()
    }

    private func processBankResponse(_ response: [String: Any], config: [String: Any]) -> Bool {
        let notificationSettings = config["notifications"] as? [String: Any] ?? [:]
        let lang = (config["language"] as? String) ?? "et"
        var accountNames: [String: String] = [:]
        if let accounts = response["accounts"] as? [[String: Any]] {
            for account in accounts {
                let id = account["id"] as? String ?? ""
                let display = (account["display_name"] as? String).flatMap { $0.isEmpty ? nil : $0 }
                    ?? (account["name"] as? String ?? "")
                if !id.isEmpty { accountNames[id] = display }
            }
        }

        var seen = Set((defaults.array(forKey: seenKey) as? [String]) ?? [])
        if let known = config["knownBankKeys"] as? [String] { seen.formUnion(known) }
        var seeded = defaults.bool(forKey: seededKey) || !seen.isEmpty
        var newCount = 0
        if let transactions = response["transactions"] as? [[String: Any]] {
            for tx in transactions.reversed() {
                guard let key = tx["bank_key"] as? String, !key.isEmpty else { continue }
                if !seen.contains(key), seeded, isRecent(tx["date"] as? String ?? "") {
                    let account = accountNames[tx["account_id"] as? String ?? ""] ?? ""
                    showBankNotification(tx: tx, accountName: account, settings: notificationSettings, lang: lang)
                    newCount += 1
                }
                seen.insert(key)
            }
        }
        if !seeded { seeded = true }
        if seen.count > 2000 { seen = Set(seen.suffix(2000)) }
        defaults.set(Array(seen), forKey: seenKey)
        defaults.set(seeded, forKey: seededKey)
        return newCount > 0
    }

    private func showBankNotification(tx: [String: Any], accountName: String, settings: [String: Any], lang: String) {
        let type = tx["type"] as? String ?? "expense"
        let income = type == "income"
        if income && (settings["moneyReceived"] as? Bool) == false { return }
        if !income && (settings["moneySpent"] as? Bool) == false { return }
        let privacy = settings["privacy"] as? String ?? "hideAmount"
        let amount = (tx["amount"] as? NSNumber)?.doubleValue ?? 0
        let merchant = (tx["merchant"] as? String) ?? (tx["note"] as? String ?? "")
        let et = lang == "et"
        let content = UNMutableNotificationContent()
        content.sound = .default

        if privacy == "generic" {
            content.title = et ? "Uus pangategevus" : "New bank activity"
            content.body = et ? "Ava Nexora üksikasjade vaatamiseks." : "Open Nexora to view the details."
        } else if privacy == "hideAmount" {
            content.title = income ? (et ? "Raha laekus" : "Money received") : (et ? "Raha läks kontolt" : "Money spent")
            content.body = et ? "Ava Nexora üksikasjade vaatamiseks." : "Open Nexora to view the details."
        } else {
            let formatted = formatMoney(amount, lang: lang)
            content.title = income ? (et ? "+\(formatted) laekus" : "+\(formatted) received") : (et ? "−\(formatted) kontolt" : "−\(formatted) spent")
            content.body = [accountName, merchant].filter { !$0.isEmpty }.joined(separator: " · ")
        }
        let key = tx["bank_key"] as? String ?? UUID().uuidString
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: "bank-\(key)", content: content, trigger: nil))
    }

    func scheduleLocalReminders() {
        guard let config = configObject() else { return }
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { requests in
            let ids = requests.map(\.identifier).filter { $0.hasPrefix("nexora-reminder-") }
            center.removePendingNotificationRequests(withIdentifiers: ids)
            self.addTaskReminders(config: config)
            self.addBillReminders(config: config)
            self.addVehicleReminders(config: config)
            self.checkImmediateThresholds(config: config)
        }
    }

    private func addTaskReminders(config: [String: Any]) {
        let settings = config["notifications"] as? [String: Any] ?? [:]
        guard (settings["tasks"] as? Bool) != false else { return }
        let lang = config["language"] as? String ?? "et"
        let et = lang == "et"
        guard let tasks = config["tasks"] as? [[String: Any]] else { return }
        let center = UNUserNotificationCenter.current()
        let calendar = Calendar.current
        let now = Date()

        for task in tasks.prefix(128) {
            if (task["reminder"] as? Bool) == false { continue }
            guard let rawDate = task["date"] as? String, rawDate.count >= 10,
                  let day = ISO8601DateFormatter.dateOnly.date(from: String(rawDate.prefix(10))) else { continue }
            var comps = calendar.dateComponents([.year,.month,.day], from: day)
            comps.hour = 9
            comps.minute = 0
            if let rawTime = task["time"] as? String, rawTime.count >= 5 {
                let bits = rawTime.prefix(5).split(separator: ":")
                if bits.count == 2 {
                    comps.hour = Int(bits[0]) ?? 9
                    comps.minute = Int(bits[1]) ?? 0
                }
            }
            guard let fire = calendar.date(from: comps), fire > now else { continue }
            let content = UNMutableNotificationContent()
            content.sound = .default
            content.title = et ? "Ülesande meeldetuletus" : "Task reminder"
            content.body = task["title"] as? String ?? (et ? "Sul on ülesanne" : "You have a task")
            let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
            let id = task["id"] as? String ?? UUID().uuidString
            center.add(UNNotificationRequest(identifier: "nexora-reminder-task-\(id)-\(rawDate)-\(comps.hour ?? 9)-\(comps.minute ?? 0)", content: content, trigger: trigger))
        }
    }

    private func addBillReminders(config: [String: Any]) {
        let settings = config["notifications"] as? [String: Any] ?? [:]
        guard (settings["bills"] as? Bool) != false else { return }
        let lang = config["language"] as? String ?? "et"
        let et = lang == "et"
        guard let bills = config["bills"] as? [[String: Any]] else { return }
        let calendar = Calendar.current
        let now = Date()

        for bill in bills {
            if (bill["paidThisMonth"] as? Bool) == true { continue }
            let dueDay = max(1, min(31, (bill["dueDay"] as? NSNumber)?.intValue ?? 1))
            let name = bill["name"] as? String ?? (et ? "Arve" : "Bill")
            let amount = (bill["amount"] as? NSNumber)?.doubleValue ?? 0
            let id = bill["id"] as? String ?? UUID().uuidString
            for monthOffset in 0...1 {
                guard let monthDate = calendar.date(byAdding: .month, value: monthOffset, to: now),
                      let range = calendar.range(of: .day, in: .month, for: monthDate) else { continue }
                var comps = calendar.dateComponents([.year, .month], from: monthDate)
                comps.day = min(dueDay, range.count)
                comps.hour = 9
                guard let dueDate = calendar.date(from: comps) else { continue }
                for daysBefore in [7, 3, 1, 0] {
                    guard let fire = calendar.date(byAdding: .day, value: -daysBefore, to: dueDate), fire > now else { continue }
                    let content = UNMutableNotificationContent()
                    content.sound = .default
                    content.title = daysBefore == 0 ? (et ? "Arve tähtaeg on täna" : "Bill due today") : (et ? "Arve tähtaeg läheneb" : "Bill due soon")
                    content.body = "\(name) · \(formatMoney(amount, lang: lang))" + (daysBefore > 0 ? (et ? " · \(daysBefore) päeva pärast" : " · in \(daysBefore) days") : "")
                    let triggerComps = calendar.dateComponents([.year,.month,.day,.hour,.minute], from: fire)
                    let trigger = UNCalendarNotificationTrigger(dateMatching: triggerComps, repeats: false)
                    let ident = "nexora-reminder-bill-\(id)-\(comps.year ?? 0)-\(comps.month ?? 0)-\(daysBefore)"
                    UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: ident, content: content, trigger: trigger))
                }
            }
        }
    }

    private func addVehicleReminders(config: [String: Any]) {
        let settings = config["notifications"] as? [String: Any] ?? [:]
        guard (settings["vehicles"] as? Bool) != false else { return }
        let lang = config["language"] as? String ?? "et"
        let et = lang == "et"
        guard let vehicles = config["vehicles"] as? [[String: Any]] else { return }
        let calendar = Calendar.current
        let now = Date()

        for vehicle in vehicles {
            let id = vehicle["id"] as? String ?? UUID().uuidString
            let name = vehicle["name"] as? String ?? (et ? "Auto" : "Vehicle")
            for (kind, field, titleET, titleEN) in [
                ("inspection", "inspectionDate", "Ülevaatuse tähtaeg läheneb", "Vehicle inspection due soon"),
                ("insurance", "insuranceDate", "Kindlustus vajab uuendamist", "Insurance renewal is coming up")
            ] {
                guard let raw = vehicle[field] as? String, raw.count >= 10,
                      let due = ISO8601DateFormatter.dateOnly.date(from: String(raw.prefix(10))) else { continue }
                for daysBefore in [30, 14, 7, 1, 0] {
                    guard let fireDay = calendar.date(byAdding: .day, value: -daysBefore, to: due) else { continue }
                    var comps = calendar.dateComponents([.year,.month,.day], from: fireDay)
                    comps.hour = 9
                    guard let fire = calendar.date(from: comps), fire > now else { continue }
                    let content = UNMutableNotificationContent()
                    content.sound = .default
                    content.title = et ? titleET : titleEN
                    content.body = daysBefore == 0 ? (et ? "\(name) · tähtaeg on täna" : "\(name) · due today") : (et ? "\(name) · \(daysBefore) päeva pärast" : "\(name) · in \(daysBefore) days")
                    let trigger = UNCalendarNotificationTrigger(dateMatching: calendar.dateComponents([.year,.month,.day,.hour], from: fire), repeats: false)
                    UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: "nexora-reminder-\(kind)-\(id)-\(raw)-\(daysBefore)", content: content, trigger: trigger))
                }
            }
        }
    }

    private func checkImmediateThresholds(config: [String: Any]) {
        let settings = config["notifications"] as? [String: Any] ?? [:]
        let lang = config["language"] as? String ?? "et"
        let et = lang == "et"
        var sent = Set((defaults.array(forKey: reminderKey) as? [String]) ?? [])

        if (settings["vehicles"] as? Bool) != false, let vehicles = config["vehicles"] as? [[String: Any]] {
            for vehicle in vehicles {
                let next = (vehicle["nextServiceKm"] as? NSNumber)?.intValue ?? 0
                let odo = (vehicle["odometer"] as? NSNumber)?.intValue ?? 0
                if next <= 0 { continue }
                let left = next - odo
                let bucket = left <= 0 ? 0 : left <= 100 ? 100 : left <= 500 ? 500 : left <= 1000 ? 1000 : -1
                if bucket < 0 { continue }
                let id = vehicle["id"] as? String ?? "vehicle"
                let key = "service:\(id):\(next):\(bucket)"
                if sent.contains(key) { continue }
                sent.insert(key)
                let name = vehicle["name"] as? String ?? (et ? "Auto" : "Vehicle")
                let content = UNMutableNotificationContent()
                content.sound = .default
                content.title = et ? "Auto hooldus" : "Vehicle service"
                content.body = left <= 0 ? (et ? "\(name) hooldus on käes" : "\(name) service is due") : (et ? "\(name) · hoolduseni umbes \(left) km" : "\(name) · about \(left) km to service")
                UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: "nexora-reminder-\(key)", content: content, trigger: nil))
            }
        }

        if (settings["budget"] as? Bool) != false, let budget = config["budget"] as? [String: Any] {
            let limit = (budget["limit"] as? NSNumber)?.doubleValue ?? 0
            let spent = (budget["spent"] as? NSNumber)?.doubleValue ?? 0
            if limit > 0 {
                let ratio = spent / limit
                let threshold = ratio >= 1 ? 100 : ratio >= 0.9 ? 90 : ratio >= 0.8 ? 80 : 0
                let month = DateFormatter.monthKey.string(from: Date())
                let key = "budget:\(month):\(threshold)"
                if threshold > 0, !sent.contains(key) {
                    sent.insert(key)
                    let content = UNMutableNotificationContent()
                    content.sound = .default
                    content.title = threshold >= 100 ? (et ? "Kuu kululimiit on täis" : "Monthly spending limit reached") : (et ? "Kuu kululimiit hakkab täituma" : "Approaching your spending limit")
                    content.body = et ? "Oled kasutanud \(threshold)% kuu kululimiidist." : "You have used \(threshold)% of your monthly spending limit."
                    UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: "nexora-reminder-\(key)", content: content, trigger: nil))
                }
            }
        }
        defaults.set(Array(sent), forKey: reminderKey)
    }

    private func configObject() -> [String: Any]? {
        guard let raw = defaults.string(forKey: configKey), let data = raw.data(using: .utf8) else { return nil }
        return try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    }

    private func isRecent(_ raw: String) -> Bool {
        guard raw.count >= 10, let date = ISO8601DateFormatter.dateOnly.date(from: String(raw.prefix(10))) else { return true }
        return abs(Calendar.current.dateComponents([.day], from: date, to: Date()).day ?? 0) <= 2
    }

    private func formatMoney(_ amount: Double, lang: String) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: lang == "et" ? "et_EE" : "en_GB")
        return formatter.string(from: NSNumber(value: abs(amount))) ?? String(format: "%.2f €", abs(amount))
    }
}

private extension ISO8601DateFormatter {
    static let dateOnly: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()
}

private extension DateFormatter {
    static let monthKey: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM"
        return f
    }()
}
