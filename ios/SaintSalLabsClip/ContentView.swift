import SwiftUI

// MARK: - Colors
private let bgColor   = Color(red: 0.059, green: 0.059, blue: 0.059)  // #0F0F0F
private let gold      = Color(red: 0.831, green: 0.686, blue: 0.216)  // #D4AF37
private let goldLight = Color(red: 0.953, green: 0.816, blue: 0.427)  // #F3D06D
private let cardBg    = Color.white.opacity(0.04)
private let textDim   = Color.white.opacity(0.55)

// MARK: - Quick Action Model
private struct QuickAction: Identifiable {
    let id = UUID()
    let icon: String
    let label: String
    let sub: String
    let path: String
}

private let quickActions: [QuickAction] = [
    QuickAction(icon: "🔍", label: "Intelligence", sub: "5 AI engines",  path: "search"),
    QuickAction(icon: "💬", label: "Chat",         sub: "Multi-model",   path: "chat"),
    QuickAction(icon: "⚡", label: "Builder",      sub: "Build with AI", path: "build"),
]

// MARK: - Main View
struct ContentView: View {
    @State private var logoOffset: CGFloat = 0
    @State private var livePulse: Double   = 1.0
    @State private var appeared            = false

    private let fullAppURL  = URL(string: "https://apps.apple.com/app/id6760323011")!
    private let deepLinkURL = URL(string: "saintsallabs://")!

    var body: some View {
        ZStack {
            bgColor.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {

                    // ── App Badge ──────────────────────────────────────
                    appBadge
                        .padding(.horizontal, 20)
                        .padding(.top, 16)
                        .padding(.bottom, 4)

                    // ── Live badge ────────────────────────────────────
                    liveBadge
                        .padding(.top, 20)

                    // ── Logo ──────────────────────────────────────────
                    Image("AppIcon")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 120, height: 120)
                        .offset(y: logoOffset)
                        .padding(.top, 12)

                    // ── Headline ──────────────────────────────────────
                    VStack(spacing: 2) {
                        Text("THE AI THAT")
                            .font(.system(size: 42, weight: .black))
                            .foregroundColor(.white)
                            .kerning(2)
                        Text("ACTUALLY SHOWS UP")
                            .font(.system(size: 42, weight: .black))
                            .foregroundColor(gold)
                            .kerning(2)
                    }
                    .padding(.top, 10)
                    .multilineTextAlignment(.center)

                    Text("**Your Gotta Guy™.** Claude + GPT + Gemini + Grok.\nPowered by Patented HACP™ Technology.")
                        .font(.system(size: 13))
                        .foregroundColor(textDim)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                        .padding(.horizontal, 28)
                        .padding(.top, 10)

                    // ── Primary CTA ───────────────────────────────────
                    primaryCTA
                        .padding(.top, 20)
                        .padding(.horizontal, 24)

                    // ── Quick Actions ─────────────────────────────────
                    quickActionsGrid
                        .padding(.top, 10)
                        .padding(.horizontal, 24)

                    // ── Trust Signals ─────────────────────────────────
                    trustCard
                        .padding(.horizontal, 16)
                        .padding(.top, 16)

                    // ── HB Promo ──────────────────────────────────────
                    hbPromo
                        .padding(.horizontal, 16)
                        .padding(.top, 10)

                    // ── Footer ────────────────────────────────────────
                    footer
                        .padding(.top, 20)
                        .padding(.bottom, 40)
                }
            }
        }
        .onAppear {
            startAnimations()
        }
    }

    // MARK: - App Badge
    private var appBadge: some View {
        HStack(spacing: 10) {
            Image("AppIcon")
                .resizable()
                .scaledToFit()
                .frame(width: 40, height: 40)
            VStack(alignment: .leading, spacing: 1) {
                Text("SaintSal™ Labs")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                Text("Responsible Intelligence™")
                    .font(.system(size: 11))
                    .foregroundColor(Color.white.opacity(0.4))
            }
            Spacer()
            Button(action: openFullApp) {
                Text("Open")
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(bgColor)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(gold)
                    .clipShape(Capsule())
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(Color.white.opacity(0.05))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.white.opacity(0.1), lineWidth: 1))
        .cornerRadius(14)
    }

    // MARK: - Live Badge
    private var liveBadge: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(Color(red: 0, green: 1, blue: 0.53))
                .frame(width: 5, height: 5)
                .opacity(livePulse)
            Text("ALL 8 AI PROVIDERS LIVE · PATENT #10,290,222")
                .font(.system(size: 9, weight: .black))
                .kerning(2)
                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 5)
        .background(Color(red: 0, green: 1, blue: 0.53).opacity(0.08))
        .overlay(Capsule().stroke(Color(red: 0, green: 1, blue: 0.53).opacity(0.2), lineWidth: 1))
        .clipShape(Capsule())
    }

    // MARK: - Primary CTA
    private var primaryCTA: some View {
        Button(action: openDeepLink) {
            HStack {
                Text("⚡ START FREE — NO CARD NEEDED")
                    .font(.system(size: 17, weight: .black))
                    .foregroundColor(bgColor)
                    .kerning(1.5)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(gold)
            .cornerRadius(14)
            .shadow(color: gold.opacity(0.35), radius: 20, x: 0, y: 8)
        }
    }

    // MARK: - Quick Actions
    private var quickActionsGrid: some View {
        HStack(spacing: 8) {
            ForEach(quickActions) { action in
                Button(action: { openPath(action.path) }) {
                    VStack(spacing: 6) {
                        Text(action.icon)
                            .font(.system(size: 22))
                        Text(action.label)
                            .font(.system(size: 12, weight: .black))
                            .foregroundColor(gold)
                            .kerning(0.5)
                        Text(action.sub)
                            .font(.system(size: 9))
                            .foregroundColor(Color.white.opacity(0.38))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(cardBg)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(gold.opacity(0.15), lineWidth: 1))
                    .cornerRadius(12)
                }
            }
        }
    }

    // MARK: - Trust Card
    private var trustCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            trustRow(icon: "🔒", text: "Encrypted & private · HIPAA ready")
            trustRow(icon: "⚡", text: "US Patent #10,290,222 · Apple & Google recognized")
            trustRow(icon: "🏛️", text: "Saint Vision Technologies LLC · Huntington Beach, CA")
        }
        .padding(12)
        .background(Color.white.opacity(0.025))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(gold.opacity(0.12), lineWidth: 1))
        .cornerRadius(12)
    }

    private func trustRow(icon: String, text: String) -> some View {
        HStack(spacing: 8) {
            Text(icon).font(.system(size: 14))
            Text(text)
                .font(.system(size: 11))
                .foregroundColor(Color.white.opacity(0.45))
        }
    }

    // MARK: - HB Promo
    private var hbPromo: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("HB LOCALS SPECIAL 🏄")
                    .font(.system(size: 9, weight: .black))
                    .kerning(2)
                    .foregroundColor(gold.opacity(0.8))
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("20% OFF")
                        .font(.system(size: 18, weight: .black))
                        .foregroundColor(.white)
                    Text("FIRST MONTH")
                        .font(.system(size: 14, weight: .black))
                        .foregroundColor(gold)
                }
            }
            Spacer()
            VStack(spacing: 2) {
                Text("HBLOCAL")
                    .font(.system(size: 15, weight: .black))
                    .foregroundColor(bgColor)
                    .kerning(3)
                Text("AT CHECKOUT")
                    .font(.system(size: 7, weight: .bold))
                    .foregroundColor(bgColor.opacity(0.7))
                    .kerning(1)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(gold)
            .cornerRadius(8)
        }
        .padding(12)
        .background(gold.opacity(0.08))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(gold.opacity(0.3), lineWidth: 1))
        .cornerRadius(12)
    }

    // MARK: - Footer
    private var footer: some View {
        VStack(spacing: 10) {
            HStack(spacing: 20) {
                Link("Privacy Policy", destination: URL(string: "https://saintsallabs.com/privacy")!)
                    .font(.system(size: 11))
                    .foregroundColor(Color.white.opacity(0.3))
                Link("Terms of Use", destination: URL(string: "https://saintsallabs.com/terms")!)
                    .font(.system(size: 11))
                    .foregroundColor(Color.white.opacity(0.3))
                Button("Full App", action: openFullApp)
                    .font(.system(size: 11))
                    .foregroundColor(Color.white.opacity(0.3))
            }
            Text("© 2026 Saint Vision Technologies LLC\nUS Patent #10,290,222 · Responsible Intelligence™")
                .font(.system(size: 10))
                .foregroundColor(Color.white.opacity(0.2))
                .multilineTextAlignment(.center)
                .lineSpacing(3)
        }
    }

    // MARK: - Actions
    private func openFullApp() {
        UIApplication.shared.open(fullAppURL)
    }

    private func openDeepLink() {
        if UIApplication.shared.canOpenURL(deepLinkURL) {
            UIApplication.shared.open(deepLinkURL)
        } else {
            UIApplication.shared.open(fullAppURL)
        }
    }

    private func openPath(_ path: String) {
        let url = URL(string: "saintsallabs://\(path)") ?? deepLinkURL
        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        } else {
            UIApplication.shared.open(fullAppURL)
        }
    }

    // MARK: - Animations
    private func startAnimations() {
        // Float logo
        withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
            logoOffset = -10
        }
        // Pulse live dot
        withAnimation(.easeInOut(duration: 0.75).repeatForever(autoreverses: true)) {
            livePulse = 0.3
        }
    }
}

#Preview {
    ContentView()
}
