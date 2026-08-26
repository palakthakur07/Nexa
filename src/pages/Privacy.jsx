import StaticPage from "../components/StaticPage.jsx";

export default function Privacy() {
  return (
    <StaticPage eyebrow="/privacy" title="Privacy Policy" updated="August 2026">
      <p>
        This page explains what information NEXA collects, how it&apos;s
        used, and the choices you have about it.
      </p>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>What we collect</h2>
        <p className="mt-1.5">
          When you create an account, we collect your name and email address.
          If you complete your profile or register as a mentor, we also store
          what you choose to share — headline, location, profession,
          organization, topics, languages, availability, a short bio, and an
          optional profile photo. If you use the mentor network, we store
          connection requests, messages between you and a mentor or mentee,
          and any rating or feedback left after an accepted mentorship.
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>How we use it</h2>
        <p className="mt-1.5">
          We use this information to run the product: matching you with
          relevant opportunities, showing your mentor profile to people
          browsing the network, enabling messaging between connected users,
          and personalizing recommendations. We don&apos;t sell your personal
          information to third parties.
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>What&apos;s visible to others</h2>
        <p className="mt-1.5">
          If you register as a mentor, your name, headline, location,
          profession, organization, bio, topics, languages, availability, and
          photo are visible to anyone browsing the mentor network. Your email
          address is never shown publicly. Messages you send through the
          platform are only visible to you and the person you&apos;re
          messaging.
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>Your choices</h2>
        <p className="mt-1.5">
          You can edit or remove most of your profile information at any
          time, including your photo. You can block or report another user
          from within the app. To request deletion of your account or data,
          reach out through the app.
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>Changes</h2>
        <p className="mt-1.5">
          We may update this policy as the product evolves. We&apos;ll update
          the date at the top of this page when we do.
        </p>
      </div>
    </StaticPage>
  );
}