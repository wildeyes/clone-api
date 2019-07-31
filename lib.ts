import { resolve } from 'path'
import * as fs from 'fs'
import * as yaml from 'yaml'
import express, { Response, Request, NextFunction } from 'express'
import axios, { AxiosRequestConfig } from 'axios'
import parse from 'url-parse'
import mkdirp from 'mkdirp-promise'

export const path = {
  out: resolve(__dirname, 'out'),
  data(name: string) {
    return resolve(this.out, name + '.json')
  },
}

mkdirp(path.out)

export async function start(filepath: string, port: number) {
  const file = fs.readFileSync(filepath)
  const datafile = yaml.parse(file.toString()) as AxiosRequestConfig[]
  const outfile = getOutFileForYAML(datafile)
  const endpointData: { url: string; data: any }[] = fs.existsSync(outfile)
    ? JSON.parse(fs.readFileSync(outfile).toString())
    : await clone(filepath)

  const app = express()

  console.log('Setting up endpoints...')
  datafile.forEach(({ url, method = 'GET', headers }, index) => {
    const { data } = endpointData[index]
    const { pathname } = parse(url)

    console.log(`[${method}] ${baseurl()}${pathname} ${headersTxt(headers)}`)
    app[method.toLowerCase()](pathname, function(
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      console.log(
        `Request from client: ${method} ${url} ${headersTxt(headers)}`
      )
      if (headers)
        for (const [key, value] of Object.entries(headers)) {
          if (req.headers[key.toLowerCase()] !== value) {
            return next(/* {
              err: 'headers mismatch',
              details: { sentHeaders: req.headers, wantedHeaders: headers },
            } */)
          }
        }
      res.send(data)
    })
  })

  const server = app.listen(port, () =>
    console.log('Running CloneAPI at ' + baseurl())
  )
  function baseurl() {
    return 'http://localhost:' + port
  }

  return { close: server.close.bind(server) }
}
/**
 * Note: the clone function depends on the order, if the order changes without clearing the cache, it'll fuck things up.
 */
async function clone(filepath) {
  const file = fs.readFileSync(filepath)
  const datafile = yaml.parse(file.toString()) as AxiosRequestConfig[]
  const apiData = await Promise.all(
    datafile.map(async (config: AxiosRequestConfig, index) => {
      const { url, headers } = config
      console.log(`Requesting ${url}...  ${headersTxt(headers)}`)
      const { data } = await axios.request(config)

      return { index, url, data }
    })
  )
  // its easier to manage in one file, but i would have also preferred it in a seperate file per request
  fs.writeFileSync(getOutFileForYAML(datafile), JSON.stringify(apiData))
  return apiData
}

function getOutFileForYAML(config: AxiosRequestConfig[]) {
  // this line here means we choose the first url as the name for the json file in out/XXX.json
  // TODO validation on yaml scheme
  const baseurl = config[0].url
  const basename = parse(baseurl).hostname
  return path.data(basename)
}

function headersTxt(headers) {
  return headers
    ? Object.entries(headers)
        .map(([k, v]) => `${k}:${v}`)
        .join(',')
    : ''
}
