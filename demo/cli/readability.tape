# Generate demo/cli/readability.gif for the README.
# Install VHS (https://github.com/charmbracelet/vhs), then from the repo root:
#   vhs demo/cli/readability.tape

Output demo/cli/readability.gif

Set Shell "bash"
Set FontSize 18
Set Width 1000
Set Height 620
Set Theme "Dracula"
Set Padding 20

Type "cat demo/before.txt"
Enter
Sleep 800ms
Type "cat demo/before.txt | node src/check.js"
Enter
Sleep 2500ms

Type "cat demo/cli/after.txt"
Enter
Sleep 800ms
Type "cat demo/cli/after.txt | node src/check.js"
Enter
Sleep 3000ms
