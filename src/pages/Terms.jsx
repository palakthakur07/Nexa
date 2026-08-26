import StaticPage from "../components/StaticPage.jsx";

export default function Terms() {
  return (
    <StaticPage eyebrow="/terms" title="Terms of Service" updated="August 2026">
      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>Using NEXA</h2>
        <p className="mt-1.5">
          NEXA helps you discover opportunities and connect with mentors. By
          creating an account, you agree to use the platform honestly — the
          information in your profile and mentor listing should be accurate,
          and any messages you send should be respectful.
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>Mentors and mentorship</h2>
        <p className="mt-1.5">
          Mentors on NEXA are individual, self-registered users volunteering
          their time and experience — not NEXA employees or agents, and not
          professional advisors acting in that capacity through the app.
          Advice or guidance you receive from a mentor is offered informally,
          and NEXA doesn&apos;t vet, endorse, or guarantee the accuracy of
          anything a mentor shares.
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>Conduct</h2>
        <p className="mt-1.5">
          You may not use NEXA to harass, impersonate, or misrepresent
          yourself to another user. We reserve the right to remove content or
          suspend accounts that violate this or otherwise abuse the platform.
          You can report or block another user at any time from within the
          app.
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>Your content</h2>
        <p className="mt-1.5">
          You keep ownership of what you post — your profile, bio, and any
          photo you upload. By posting it, you give NEXA permission to
          display it within the app to the people it&apos;s meant for (e.g.
          showing your mentor profile to other users browsing the network).
        </p>
      </div>

      <div>
        <h2 className="font-display text-[1.1rem]" style={{ color: "var(--text-primary)" }}>Disclaimer</h2>
        <p className="mt-1.5">
          NEXA is provided &quot;as is,&quot; without warranties of any kind.
          We do our best to keep opportunity listings and mentor information
          accurate and up to date, but we can&apos;t guarantee it.
        </p>
      </div>
    </StaticPage>
  );
}