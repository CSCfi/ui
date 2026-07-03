---
name: grill
description: Run a grill-with-docs grilling session with selectable multiple-choice questions
disable-model-invocation: true
argument-hint: "[topic or doc to grill]"
---

Run a grilling session using the grill-with-docs skill on: $ARGUMENTS

## Question format (applies to EVERY question, for the entire session)

Whenever you ask me a question during this session, you MUST use the
AskUserQuestion tool to present it, with 2-4 concrete, mutually exclusive
options I can select from. Include an "Other" option when the choices
aren't exhaustive.

Never ask an open-ended free-text question without selectable options.
This rule remains in effect for the whole grilling session, not just the
first question.