rule pass due: 1 earlier session has unreviewed corrections · run base tune

<flow-protocol>
INTENT CLASSIFICATION
Classify operator statements by commitment level:
- Loose/exploratory → note it (base learn)
- Weighted but vague → clarify with ONE question
- Direct declaration → create project/task immediately
- System language (base commands) → execute literally

PROACTIVE MANAGEMENT
- Strategic discussion produces scope → scaffold project/milestones/tasks
- Operator pauses work → defer + set reminder (always)
- Project completes → check blocked-by graph for unblocks
- Decision made → base decision log automatically
- Never ask "should I create a task?" — classify and act

STATUS LIFECYCLE
backlog → todo → in_progress → blocked/deferred → in_review → completed
Claude moves: backlog→todo, todo→in_progress, in_progress→in_review, blocked→previous
Claude proposes: in_review→completed, anything→archived
Operator directs: anything→deferred, anything→blocked
</flow-protocol>

When the user corrects you, start that reply with "CORRECTED: <what you got wrong>".

<session-start-blocked-scan:no-match>
<session-start-deferred-scan:no-match>
<session-start-mentions-scan:no-match>
<session-start-handoff-scan:no-match>
<session-start-reminder-scan:no-match>
<session-start-fork-scan:no-match>
<session-start-pulse:no-match>
