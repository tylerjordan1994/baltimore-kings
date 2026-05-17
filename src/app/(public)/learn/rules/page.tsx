"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function RulesPage() {
  return (
    <>
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Rules Reference
          </h1>
          <p className="mt-2 text-muted-foreground">
            Official futsal and MASL3 arena rules. Bookmark this page for quick lookups during disputes.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-20 pt-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Futsal Rules */}
          <div className="mb-12">
            <h2 className="mb-6 font-heading text-2xl font-bold text-ink">
              Futsal Rules
            </h2>
            <div className="space-y-2">
              <Accordion title="Players and Format">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li><strong>5v5</strong> — 4 outfield players + 1 goalkeeper per side.</li>
                  <li>Minimum 3 players required to start or continue a match.</li>
                  <li>Game length: <strong>two 20-minute halves</strong> (running clock). Clock stops in the final minute of each half for dead balls in competitive play.</li>
                  <li>No walls — the ball goes out of play when it fully crosses the touchline or goal line.</li>
                </ul>
              </Accordion>

              <Accordion title="Kick-In (Sideline Restart)">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>When the ball crosses the touchline, the opposing team takes a <strong>kick-in</strong> (not a throw-in).</li>
                  <li>Ball must be placed <strong>stationary on the line</strong> at the point where it went out.</li>
                  <li>Opponents must be at least <strong>5 meters</strong> away.</li>
                  <li>Must be played within <strong>4 seconds</strong> of being set — otherwise possession is awarded to the other team.</li>
                  <li><strong>Cannot score directly</strong> from a kick-in.</li>
                  <li><strong>Double touch rule:</strong> the kicker cannot touch the ball again until another player touches it.</li>
                </ul>
              </Accordion>

              <Accordion title="Corner Kicks">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>Taken from the corner when the defending team last touches the ball before it crosses the goal line.</li>
                  <li><strong>4-second limit</strong> to take the kick.</li>
                  <li>Opponents must be 5 meters away.</li>
                  <li>You <strong>can score directly</strong> from a corner kick.</li>
                  <li>Double touch rule applies.</li>
                </ul>
              </Accordion>

              <Accordion title="Goal Clearance (No Goal Kick)">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>When the attacking team last touches the ball before it crosses the goal line, the goalkeeper restarts play.</li>
                  <li>The GK <strong>throws the ball</strong> from inside the penalty area — no kicking from the ground.</li>
                  <li><strong>4-second limit</strong> from when the GK has the ball.</li>
                  <li>The ball must leave the penalty area before another player can touch it.</li>
                  <li>Cannot score directly from a goal clearance.</li>
                </ul>
              </Accordion>

              <Accordion title="No Offside">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>There is <strong>no offside rule</strong> in futsal.</li>
                  <li>Players are free to position themselves anywhere on the court at any time.</li>
                </ul>
              </Accordion>

              <Accordion title="Accumulated Fouls">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>Fouls are counted per team, per half.</li>
                  <li>After the <strong>5th accumulated team foul</strong> in a half, every subsequent foul results in a <strong>direct free kick from the second penalty spot</strong> (10 meters).</li>
                  <li><strong>No wall allowed</strong> on these 10m free kicks — the defending team must be behind the ball.</li>
                  <li>The GK cannot come further than 5 meters from the goal line on these kicks.</li>
                  <li>If the foul occurs between the second penalty spot and the goal, the kick is taken from the spot of the foul.</li>
                </ul>
              </Accordion>

              <Accordion title="Back-Pass Rule">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>The goalkeeper can only receive a <strong>deliberate pass from a teammate once per possession</strong>.</li>
                  <li>After the GK releases the ball, it must touch an opponent or cross the halfway line before being passed back to the GK.</li>
                  <li>Violation results in an <strong>indirect free kick</strong> from the penalty area line.</li>
                  <li>The GK may receive the ball any number of times if it is played by an opponent or is an unintentional pass (deflection, tackle).</li>
                </ul>
              </Accordion>

              <Accordion title="Substitutions">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li><strong>Unlimited substitutions</strong> — fly-on/fly-off.</li>
                  <li>Players swap on the go through the substitution zone (near halfway line on your own bench side).</li>
                  <li>The leaving player must fully exit before the entering player can step on court.</li>
                  <li>Substitutions can be made at any time (play does not stop).</li>
                </ul>
              </Accordion>

              <Accordion title="Power Play (5v4 / Flying Goalkeeper)">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>A team may pull the GK and use a <strong>5th outfield player</strong> (power play).</li>
                  <li>The designated GK must wear a different colored bib/jersey.</li>
                  <li>If the team concedes while in power play, the goal counts and play restarts normally.</li>
                  <li>Common in the final minutes when trailing.</li>
                </ul>
              </Accordion>

              <Accordion title="Free Kicks and Penalties">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li><strong>Direct free kicks:</strong> can score without another player touching the ball.</li>
                  <li><strong>Indirect free kicks:</strong> must touch another player before entering the goal.</li>
                  <li><strong>Penalty kick:</strong> taken from the 6-meter mark. All players behind the ball. GK stays on the line.</li>
                  <li>Wall must be at least 5 meters from the ball on free kicks.</li>
                  <li>4-second time limit on all dead-ball situations.</li>
                </ul>
              </Accordion>
            </div>
          </div>

          {/* MASL3 Rules */}
          <div>
            <h2 className="mb-6 font-heading text-2xl font-bold text-ink">
              MASL3 Arena Soccer Rules
            </h2>
            <div className="space-y-2">
              <Accordion title="Players and Format">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li><strong>6v6</strong> — 5 outfield players + 1 goalkeeper per side.</li>
                  <li>Game length: <strong>4 x 15-minute quarters</strong> (running clock, stops in final 2 minutes of the 4th quarter).</li>
                  <li>Walled field — the ball is <strong>always in play</strong> off the boards (dasher boards surround the pitch).</li>
                  <li>No throw-ins, no sideline stoppages — the ball ricochets off the boards and play continues.</li>
                </ul>
              </Accordion>

              <Accordion title="3-Line Violation">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>The ball <strong>cannot cross 3 lines in the air</strong> without touching a player or the boards.</li>
                  <li>The lines are: defensive red line, center red line, and offensive red line (or blue lines depending on venue markings).</li>
                  <li>Violation results in a free kick for the opposing team from the spot where the ball was last played.</li>
                  <li>This prevents aimless long clearances — teams must play through the lines.</li>
                </ul>
              </Accordion>

              <Accordion title="Blue Line and Red Line Markings">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li><strong>Red center line:</strong> divides the field in half.</li>
                  <li><strong>Blue lines:</strong> mark the attacking/defensive zones (similar to hockey).</li>
                  <li><strong>Red lines near goal:</strong> define the defensive zone behind the blue lines.</li>
                  <li>These markings determine where certain restarts occur and where the 3-line violation is measured.</li>
                </ul>
              </Accordion>

              <Accordion title="Substitutions">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li><strong>Unlimited substitutions</strong> — fly-on/fly-off like hockey.</li>
                  <li>Substitution happens at the bench area. The leaving player must be within the substitution zone before the new player enters.</li>
                  <li>Can substitute during live play (no stoppage needed).</li>
                  <li>Too many players on the field results in a time penalty.</li>
                </ul>
              </Accordion>

              <Accordion title="Time Penalties (Like Hockey)">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>Yellow card fouls result in a <strong>2-minute time penalty</strong>.</li>
                  <li>The penalized player sits in the penalty box and the team plays <strong>short-handed</strong> (5v6).</li>
                  <li>If the opposing team scores during the power play, the penalized player is released early.</li>
                  <li>Red card = ejection + 5-minute penalty. Team plays short for the full 5 minutes regardless of goals scored.</li>
                  <li>Accumulation of yellow cards (typically 3) in a single game results in a red card.</li>
                </ul>
              </Accordion>

              <Accordion title="Power Play">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>When the opponent has a player in the penalty box, the team with the advantage has a <strong>power play</strong> (6v5).</li>
                  <li>Similar to hockey — the offense can exploit the extra player advantage.</li>
                  <li>Double power play (6v4) is possible if two opponents receive time penalties.</li>
                </ul>
              </Accordion>

              <Accordion title="Shootout Format">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>If the game is drawn after regulation, a <strong>shootout</strong> determines the winner.</li>
                  <li>Each team selects shooters who go 1v1 against the goalkeeper from the penalty spot.</li>
                  <li>Best-of-5 initially, then sudden death if still tied.</li>
                  <li>Regular-season games may end in a draw with a bonus point for the shootout winner (league rules vary).</li>
                </ul>
              </Accordion>

              <Accordion title="Goalkeeper Rules">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>GK can play the ball anywhere on the field but cannot cross the center line with the ball.</li>
                  <li>GK must distribute the ball within <strong>5 seconds</strong> after gaining possession.</li>
                  <li>GK can use feet or hands inside the crease area.</li>
                  <li>Opposing players cannot enter the crease unless the ball is already there.</li>
                </ul>
              </Accordion>

              <Accordion title="Fouls and Free Kicks">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>Direct and indirect free kicks apply similarly to outdoor soccer.</li>
                  <li>The wall must be at least 15 feet away.</li>
                  <li>Dangerous play, boarding (pushing into boards), and slide tackles from behind are penalized heavily.</li>
                  <li>Slide tackles are <strong>permitted</strong> in MASL (unlike futsal) but must be clean — studs-up or from behind = time penalty.</li>
                </ul>
              </Accordion>

              <Accordion title="Delayed Penalty">
                <ul className="list-inside list-disc space-y-2 text-sm text-ink/80">
                  <li>If a foul occurs but the fouled team maintains possession, the referee may <strong>delay the whistle</strong>.</li>
                  <li>The non-offending team gets to play on with advantage.</li>
                  <li>If they score, the penalty is still assessed (time penalty served).</li>
                  <li>If possession is lost, the free kick is awarded from the spot of the original foul.</li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-heading text-sm font-semibold text-ink">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}
