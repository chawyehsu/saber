// https://www.npmjs.com/package/normalize-repo
interface RepositoryObject {
  url: string
  directory?: string
  type?: string
}

interface NormalizedRepo {
  url: string
  shortcut?: string
  provider?: string
  owner?: string
  name?: string
}

enum Providers {
  'github.com' = 'github',
  'gist.github.com' = 'gist',
  'gitlab.com' = 'gitlab',
  'bitbucket.org' = 'bitbucket',
}

function removeGit(path: string): string {
  return path.endsWith('.git') ? path.slice(0, -4) : path
}

// See https://docs.npmjs.com/files/package.json#repository for more info

function normalizeRepo(repo: RepositoryObject | string): NormalizedRepo {
  if (typeof repo === 'object') {
    const { url, type } = repo
    if (!url) {
      throw new Error('No repository URL was given.')
    }

    try {
      const parsedUrl = new URL(url)
      const hostname: string = parsedUrl.hostname.startsWith('www.')
        ? parsedUrl.hostname.slice(4)
        : parsedUrl.hostname
      let shortcut
      let provider
      let owner
      let name

      if (hostname in Providers && (!type || type === 'git')) {
        provider = (Providers as any)[hostname]

        const results = /^\/([^/]+)(?:\/([^/]+))?$/.exec(parsedUrl.pathname)
        if (results === null) {
          throw new Error('The repository URL is invalid.')
        }

        owner = provider === 'gist' ? removeGit(results[1]) : results[1]
        name = results[2] && removeGit(results[2])

        shortcut
          = provider === 'gist'
            ? `${provider}:${owner}`
            : `${provider}:${owner}/${name}`
      }

      return { url, shortcut, provider, owner, name }
    } catch {
      throw new Error('The repository URL is invalid.')
    }
  } else {
    const results = /^(github:|gitlab:|bitbucket:|gist:)?([-\w]+)(?:\/([-.\w]+))?$/.exec(
      repo,
    )

    if (results === null) {
      throw new Error('Malformatted repository shortkey.')
    }

    let [, provider, owner, name] = results
    provider = provider ? provider.slice(0, -1) : Providers['github.com']

    if (provider === Providers['gist.github.com']) {
      if (name) {
        throw new Error('Malformatted repository shortkey.')
      }
    } else if (!name) {
      throw new Error('Malformatted repository shortkey.')
    }

    const providers = Providers as { [key: string]: any }
    const hostname = Object.keys(providers).find(
      key => providers[key] === provider,
    )

    const url = `https://${hostname}/${provider === 'gist' ? owner : `${owner}/${name}`
      }.git`

    return { url, shortcut: repo, provider, owner, name }
  }
}

export default normalizeRepo
export { normalizeRepo }

if (typeof module !== 'undefined') {
  module.exports = normalizeRepo
  module.exports.default = normalizeRepo
  module.exports.normalizeRepo = normalizeRepo
}
