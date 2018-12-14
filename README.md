# Grex

- Replace the the `REACT_APP_GOOGLE_MAPS_API` in `docker-compose.yml` with a real Google Maps API Key: `https://cloud.google.com/maps-platform/#get-started`

- For vanilla docker run: `docker-compose up grex`

- Further documentation will follow, bear with us :)

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
