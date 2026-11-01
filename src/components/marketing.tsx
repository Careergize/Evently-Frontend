"use client";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Users,
  CalendarDays,
  Leaf,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Brand, VeyraMark } from "./brand";
import { Button } from "./ui/button";
const faqs = [
  [
    "Do guests need an account?",
    "No. Guests open an invitation link and respond directly, without an account or an app.",
  ],
  [
    "Can one invitation include a whole family?",
    "Yes. Invite a household, set its party limit and collect separate attendance counts for each function.",
  ],
  [
    "Can guests update an RSVP?",
    "Yes, while responses remain open. Guests use their invitation or private update link to change their response.",
  ],
  [
    "How are catering estimates calculated?",
    "Veyra uses RSVP counts and probabilities you choose, plus a contingency. These are transparent planning estimates, not guaranteed attendance or savings.",
  ],
  [
    "Does Veyra automatically send WhatsApp messages?",
    "No. Sharing and reminders open a prepared message in WhatsApp. You choose when to send it; opening a link does not confirm delivery.",
  ],
  [
    "Who can access my guest information?",
    "Your account and assigned managers can manage guests. Viewers receive reports, while assigned catering partners see approved planning summaries without guest contact details.",
  ],
];
export function Marketing() {
  return (
    <main className="veyra-landing">
      <nav className="veyra-nav" aria-label="Main navigation">
        <Brand />
        <div className="veyra-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#invitations">Invitations</a>
          <a href="#professionals">For professionals</a>
          <Link href="/login">Sign in</Link>
          <Button asChild>
            <Link href="/register">
              Create Your Event <ArrowUpRight size={15} />
            </Link>
          </Button>
        </div>
      </nav>
      <section className="veyra-hero">
        <div className="veyra-hero-copy">
          <span className="veyra-kicker">
            <span /> A little clarity. A better celebration.
          </span>
          <h1>
            Every guest.
            <br />
            <em>Every moment.</em>
          </h1>
          <p>
            Beautiful invitations, effortless RSVPs, and smarter event
            planning—all in one place.
          </p>
          <div className="veyra-actions">
            <Button asChild>
              <Link href="/register">
                Create Your Event <ArrowRight size={16} />
              </Link>
            </Button>
            <a className="veyra-text-link" href="#how-it-works">
              Explore Veyra <ArrowRight size={16} />
            </a>
          </div>
          <p className="veyra-hero-note">
            <Check size={15} /> No app for your guests. Just an invitation.
          </p>
        </div>
        <div
          className="veyra-product-preview"
          aria-label="Illustrative Veyra event dashboard"
        >
          <div className="preview-window-bar">
            <Brand />
            <span>EVENT OVERVIEW</span>
            <span className="preview-window-dot" />
          </div>
          <div className="preview-dark">
            <span className="veyra-kicker">YOUR PEOPLE. ONE PLACE.</span>
            <h2>Ananya & Aarav</h2>
            <p>A wedding celebration · Bengaluru</p>
            <div className="preview-date">
              <CalendarDays size={16} />
              <span>14 February 2027</span>
              <span className="preview-pill">Published</span>
            </div>
          </div>
          <div className="preview-metrics">
            {[
              ["120", "Invited people"],
              ["84", "Confirmed"],
              ["18", "Awaiting reply"],
            ].map(([n, l]) => (
              <div key={l}>
                <strong>{n}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
          <div className="preview-response">
            <div className="preview-avatar">SK</div>
            <div>
              <strong>Sharma family</strong>
              <span>4 people · Wedding ceremony</span>
            </div>
            <span className="preview-confirmed">
              <Check size={12} /> Confirmed
            </span>
          </div>
          <div className="preview-food">
            <Leaf size={19} />
            <div>
              <strong>A more thoughtful table.</strong>
              <span>Plan each meal from your guest responses.</span>
            </div>
            <ArrowUpRight size={17} />
          </div>
          <div className="preview-caption">
            Illustrative preview · your dashboard uses your saved data
          </div>
        </div>
      </section>
      <div className="veyra-occasion-strip">
        <span>ROOM FOR EVERY KIND OF TOGETHER</span>
        <p>
          Weddings <i /> Family functions <i /> Birthdays <i /> Corporate events
        </p>
      </div>
      <section className="veyra-section" id="how-it-works">
        <div className="veyra-section-heading">
          <div>
            <span className="veyra-kicker">SIMPLE FROM THE START</span>
            <h2>How Veyra Works</h2>
          </div>
          <p>
            From your first invitation to the last arrival.
            <br />
            Everything stays beautifully connected.
          </p>
        </div>
        <div className="veyra-step-grid">
          {[
            [
              "01",
              "Create something personal",
              "Choose a design, add your event details and make the invitation your own.",
            ],
            [
              "02",
              "Bring your people together",
              "Share a link or QR code. Guests confirm their household and the functions they’ll attend.",
            ],
            [
              "03",
              "Celebrate with confidence",
              "See responses, plan your meals and check in guests as they arrive.",
            ],
          ].map(([n, t, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="veyra-section veyra-invitation-section"
        id="invitations"
      >
        <div className="veyra-section-heading">
          <div>
            <span className="veyra-kicker">
              A FIRST IMPRESSION, MADE PERSONAL
            </span>
            <h2>Beautiful Digital Invitations</h2>
          </div>
          <p>
            Original designs. Your words. Your celebration.
            <br />
            Thoughtful on every screen.
          </p>
        </div>
        <div className="veyra-invitation-gallery">
          {[
            ["kerala", "Ananya & Aarav", "A celebration of tradition", "✦"],
            ["modern", "An evening together", "Elegance in every detail", "V"],
            ["floral", "A little more joy", "For moments worth sharing", "❦"],
          ].map(([kind, title, sub, motif]) => (
            <article
              className={`veyra-sample-invite sample-${kind}`}
              key={kind}
            >
              <span aria-hidden="true">{motif}</span>
              <small>YOU ARE WARMLY INVITED</small>
              <h3>{title}</h3>
              <p>{sub}</p>
              <div>14 FEBRUARY · 2027</div>
              <small>Created with Veyra</small>
            </article>
          ))}
        </div>
        <p className="veyra-section-footnote">
          Illustrative designs · six customisable templates, with mobile and
          desktop previews.
        </p>
      </section>
      <section className="veyra-section veyra-attendance">
        <div>
          <span className="veyra-kicker">FEWER FOLLOW-UPS. CLEARER PLANS.</span>
          <h2>Know Who’s Coming</h2>
          <p>
            One invitation can represent a person, a couple or an entire
            household. Keep every function’s attendance clear, even when plans
            change.
          </p>
          <ul>
            <li>
              <CheckCircle2 /> Separate counts for every function
            </li>
            <li>
              <CheckCircle2 /> Editable RSVPs without guest registration
            </li>
            <li>
              <CheckCircle2 /> Guest groups, imports and attendance exports
            </li>
          </ul>
          <Link href="/register" className="veyra-text-link">
            Make room for your people <ArrowRight size={16} />
          </Link>
        </div>
        <div className="veyra-attendance-card">
          <span className="veyra-kicker">GEORGE FAMILY · 5 INVITED</span>
          <h3>
            One family.
            <br />
            Different plans.
          </h3>
          {[
            ["Wedding ceremony", "5 attending"],
            ["Reception dinner", "3 attending"],
          ].map(([name, n]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{n}</strong>
            </div>
          ))}
          <p>Illustrative household response</p>
        </div>
      </section>
      <section className="veyra-food-section">
        <div className="veyra-section veyra-food-inner">
          <div className="veyra-food-symbol">
            <Leaf size={58} strokeWidth={1} />
            <span>
              Considered quantities.
              <br />
              Confident celebrations.
            </span>
          </div>
          <div>
            <span className="veyra-kicker">GOOD FOOD. LESS GUESSWORK.</span>
            <h2>Plan Food with Confidence</h2>
            <p>
              Turn your RSVP responses into a practical catering plan. Adjust
              attendance assumptions, add a contingency and share approved
              summaries with your catering partner.
            </p>
            <p className="veyra-food-disclaimer">
              Estimates stay transparent. You stay in control.
            </p>
            <Button variant="outline" asChild>
              <Link href="/register">
                Explore smarter planning <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="veyra-section" id="celebrations">
        <span className="veyra-kicker">
          PERSONAL MOMENTS. PROFESSIONAL CLARITY.
        </span>
        <h2>Designed for Every Celebration</h2>
        <div className="veyra-occasion-grid">
          {[
            [
              "01",
              "Weddings & receptions",
              "Every ceremony, every household, every meal.",
            ],
            [
              "02",
              "Family celebrations",
              "Birthdays, housewarmings and cherished traditions.",
            ],
            [
              "03",
              "Corporate & professional events",
              "Clear invitations and attendance for your next gathering.",
            ],
          ].map(([n, t, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="veyra-section veyra-professionals" id="professionals">
        <Users size={34} strokeWidth={1.2} />
        <div>
          <span className="veyra-kicker">BETTER, TOGETHER</span>
          <h2>Built for Families and Event Professionals</h2>
          <p>
            Give trusted family members a helping role. Invite a catering
            partner to see approved quantities while keeping guest contacts
            private.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/partners">
            Partner with Veyra <ArrowUpRight size={15} />
          </Link>
        </Button>
      </section>
      <section className="veyra-section veyra-faq" id="faq">
        <div>
          <span className="veyra-kicker">A LITTLE MORE CLARITY</span>
          <h2>Frequently Asked Questions</h2>
          <p>Good celebrations start with clear answers.</p>
        </div>
        <div>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="veyra-closing">
        <VeyraMark size={45} />
        <span className="veyra-kicker">MORE TIME FOR WHAT MATTERS</span>
        <h2>
          Celebrate more.
          <br />
          Worry less.
        </h2>
        <p>Your people. Your plans. A beautiful way to bring them together.</p>
        <Button asChild>
          <Link href="/register">
            Create Your Event <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
      <footer className="veyra-footer">
        <div>
          <Brand />
          <p>Every guest. Every moment.</p>
        </div>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/partners">Partners</Link>
          <Link href="/login">Sign in</Link>
        </div>
        <small>© {new Date().getFullYear()} Veyra</small>
      </footer>
    </main>
  );
}
