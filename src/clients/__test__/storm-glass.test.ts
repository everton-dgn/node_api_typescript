import { StormGlass } from '@src/clients/storm-glass'
import axios from 'axios'
import stormGlassWeather3HoursFixture from '@tests/fixtures/storm-glass-weather-3-hours.json'
import stormGlassNormalizedWeather3HoursFixture from '@tests/fixtures/storm-glass-normalized-weather-3-hours.json'
import { response } from 'express'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('[client] StormGlass', () => {
  it('should return the normalized forecast from the  StormGlass service', async () => {
    const lat = -33.792726
    const lng = 151.289824
    mockedAxios.get.mockResolvedValue({
      data: stormGlassWeather3HoursFixture
    })
    const stormGlass = new StormGlass(axios)
    const beaches = await stormGlass.fetchPoints(lat, lng)
    expect(beaches).toEqual(stormGlassNormalizedWeather3HoursFixture)
  })

  it('should exclude incomplete data points', async () => {
    const lat = -33.792726
    const lng = 151.289824
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300
          },
          time: '2020-04-26T00:00:00.000'
        }
      ]
    }
    mockedAxios.get.mockResolvedValue({ data: incompleteResponse })
    const stormGlass = new StormGlass(mockedAxios)
    const beaches = await stormGlass.fetchPoints(lat, lng)
    expect(beaches).toEqual([])
  })

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726
    const lng = 151.289824
    mockedAxios.get.mockRejectedValue({ message: 'Network Error' })
    const stormGlass = new StormGlass(mockedAxios)
    const beaches = async () => await stormGlass.fetchPoints(lat, lng)
    await expect(beaches).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    )
  })

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726
    const lng = 151.289824
    mockedAxios.get.mockRejectedValue({
      response: { status: 429, data: { errors: ['Rate Limit reached'] } }
    })
    const stormGlass = new StormGlass(mockedAxios)
    const beaches = async () => await stormGlass.fetchPoints(lat, lng)
    await expect(beaches).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    )
  })
})
