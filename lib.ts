import { resolve } from 'path'
import * as fs from 'fs'
import * as yaml from 'yaml'
import express from 'express'
import axios, { AxiosRequestConfig } from 'axios'
import parse from 'url-parse'

export const path = {
  out: resolve(process.cwd(), 'out'),
  data(name: string) {
    return resolve(this.out, name + '.json')
  },
}

export async function start(filepath: string, port: number) {
  const file = fs.readFileSync(filepath)
  const datafile = yaml.parse(file.toString()) as AxiosRequestConfig[]
  const outfile = getOutFileForYAML(datafile)
  const endpointData: { url: string; data: any }[] = fs.existsSync(outfile)
    ? JSON.parse(fs.readFileSync(outfile).toString())
    : await clone(filepath)

  const endpointsAndConfig = datafile.map(d => ({
    ...d,
    ...endpointData.find(e => e.url === d.url),
  }))
  const app = express()

  endpointsAndConfig.forEach(d => {
    const { url, data, method = 'GET' } = d
    const { pathname } = parse(url)

    console.log(`Loading ${baseurl()}${pathname}`)
    app[method.toLowerCase()](pathname, function(req, res) {
      res.send(data)
    })
  })

  app.listen(port, () => console.log('Running CloneAPI at ' + baseurl()))
  function baseurl() {
    return 'http://localhost:' + port
  }
}

async function clone(filepath) {
  const file = fs.readFileSync(filepath)
  const datafile = yaml.parse(file.toString()) as AxiosRequestConfig[]
  const apiData = await Promise.all(
    datafile.map(async (config: AxiosRequestConfig) => {
      console.log(`Requesting ${config.url}...`)
      const { data } = await axios.request(config)
      // right now im diffrentiating requests by url, if we'd like same urls we'll have to think of a different scheme
      return { url: config.url, data }
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
