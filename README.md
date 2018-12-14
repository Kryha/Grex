# Grex

- Step 1: Start Bigchaindb `make reset; make run`
- Step 2: Start Frontend `npm start` in Frontend folder
- Step 3: Start Backend `node startDrone.js 5 false` (use true if using the real drone)

# Commandline args

        '-a': commandlineArgs['agents'] = parseInt(args[i+1]); break;
        '-s': commandlineArgs['simulated'] = args[i+1] === 'false' ? false : true ; break;
        '-i': commandlineArgs['id'] = args[i+1]; break;
        '-d': commandlineArgs['willDetect'] = args[i+1] === 'false' ? false : true ; break;
        '-l': commandlineArgs['location'] = args[i+1]; break;
        '-t': commandlineArgs['timeout'] = parseInt(args[i+1]); break;
        '-o': commandlineArgs['deployObjective'] = args[i+1] === 'false' ? false : true ; break;
        '--agents': commandlineArgs['agents'] = parseInt(args[i+1]); break;
        '--simulated': commandlineArgs['simulated'] = args[i+1]; break;
        '--id': commandlineArgs['id'] = args[i+1]; break;
        '--willDetect': commandlineArgs['willDetect'] = args[i+1]; break;
        '--location': commandlineArgs['location'] = args[i+1]; break;
        '--timeout': commandlineArgs['timeout'] = args[i+1]; break;
        '--objective': commandlineArgs['deployObjective'] = args[i+1] === 'false' ? false : true ; break;

## defaults

		agents: 1,
		simulated: true,
		id: 'SEARCHANDRESCUE_TEST',
		willDetect: false,
		location: random_loc(),
		timeout: 1000*10,