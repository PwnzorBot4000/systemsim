export const helpPages = new Map([
  ['',
    'cat PATH          - Display contents of a file<br />' +
    'cd PATH           - Change directory. Use \'..\' to go up a directory<br />' +
    'help [COMMAND]    - Display help for a command<br />' +
    'ls [PATH]         - List files in current directory<br />' +
    'poweroff          - Shut down the computer<br />' +
    'rm PATH           - Remove a file<br />' +
    '<br />' +
    'All binaries located in /bin can also be executed as commands.<br /><br />',
  ],
  ['cat',
    'Usage: cat PATH<br />' +
    'Display contents of a file<br />' +
    'Example: cat hello.txt<br />' +
    'Output: Hello world!<br /><br />',
  ],
  ['cd',
    'Usage: cd PATH<br />' +
    'Change directory.<br />' +
    'Examples:<br />' +
    '/ # cd bin               # Directory will now be /bin<br />' +
    '/share/stuff # cd ..     # Directory will now be /share<br />' +
    '/share/stuff # cd ../..  # Directory will now be /<br />' +
    '/root # cd ../bin        # Directory will now be /bin<br />' +
    '/root # cd /bin          # Directory will now be /bin<br />' +
    '/root # cd /             # Directory will now be /<br />',
  ],
  ['help',
    'Usage: help [COMMAND]<br />' +
    'Display help for a command<br />' +
    'Example: help     # Display generic help<br />' +
    'Example: help cd  # Display help for cd<br />',
  ],
  ['ls',
    'Usage: ls [PATH]<br />' +
    'List files in a directory<br />' +
    'ls         # List files in current directory' +
    'ls /bin    # List files in /bin directory<br />',
  ],
  ['poweroff',
    'Usage: poweroff<br />' +
    'Shuts down the computer<br />' +
    'All running programs are terminated.<br />',
  ],
  ['rm',
    'Usage: rm PATH<br />' +
    'Removes a file<br />' +
    'Example: rm hello.txt  # hello.txt is deleted<br />',
  ],
])
