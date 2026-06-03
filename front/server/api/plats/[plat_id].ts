import { proxyToBackend } from '../../utils/proxy'
export default defineEventHandler((event) => proxyToBackend(event))
