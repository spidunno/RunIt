const { Encode } = await import('https://esm.sh/console-feed');

function GUID() {
  let S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    Date.now()
  )
}

function Parse(
  method,
  data,
  staticID=undefined
) {
  // Create an ID
  const id = staticID || GUID()

  // Parse the methods
  switch (method) {
    case 'clear': {
      return {
        method,
        id
      }
    }

    case 'count': {
      const label = typeof data[0] === 'string' ? data[0] : 'default'
      if (!label) return false

      return {
        ...Count.increment(label),
        id
      }
    }

    case 'time':
    case 'timeEnd': {
      const label = typeof data[0] === 'string' ? data[0] : 'default'
      if (!label) return false

      if (method === 'time') {
        Timing.start(label)
        return false
      }

      return {
        ...Timing.stop(label),
        id
      }
    }

    case 'assert': {
      const valid = data.length !== 0

      if (valid) {
        const assertion = Assert.test(data[0], ...data.slice(1))
        if (assertion) {
          return {
            ...assertion,
            id
          }
        }
      }

      return false
    }

    case 'error': {
      const errors = data.map(error => {
        try {
          return error.stack || error
        } catch (e) {
          return error
        }
      })

      return {
        method,
        id,
        data: errors
      }
    }

    default: {
      return {
        method,
        id,
        data
      }
    }
  }
}

for (const entry of Object.entries(console)) {
	const name = entry[0];
	console[name] = (...data) => {
		postMessage(Encode(Parse(name, data)));
	}
}
onerror = (ev) => {
	console.error(ev);
}