# Records a real interactive Claude Code session using the readability skill.
# Requires the plugin installed and `claude` on PATH. From the repo root:
#   vhs demo/claude-code/claude-code-demo.tape
#
# This launches a real `claude` session and waits for a real model turn to
# finish, so timing and wording vary run to run. The rewrite text will not
# match demo/cli/after.txt — that file is a fixed example for the CLI demo
# only; this demo generates its own rewrite live.

Output demo/claude-code/claude-code-demo.gif

Set Shell "bash"
Set FontSize 14
Set Width 900
Set Height 620
Set Theme "Dracula"
Set Padding 16
Set TypingSpeed 40ms

Type "claude --allowedTools 'Bash,Read,Skill(readability:readability)'"
Enter
Sleep 2s

Type "Read demo/before.txt and check its readability. Then rewrite it in plain English so it scores 60+ on Reading Ease, check the rewrite's score too, and reply with both JSON results and the rewritten text. Do not edit or write any files."
Enter
Sleep 85s
