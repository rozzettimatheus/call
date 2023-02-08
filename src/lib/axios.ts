import axios from 'axios'

export const api = axios.create({
  baseURL: '/api', // same url as backend
})
