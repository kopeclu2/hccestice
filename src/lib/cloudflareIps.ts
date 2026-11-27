import { BlockList, isIP } from 'node:net'

/**
 * Rozsahy IP, ze kterých Cloudflare posílá požadavky na origin.
 * Zdroj: https://www.cloudflare.com/ips-v4 a https://www.cloudflare.com/ips-v6
 * (staženo 27. 11. 2026). Cloudflare je mění zřídka a s předstihem; při
 * změně seznam jen přepsat, kód na něm nic dalšího nestaví.
 */
const CLOUDFLARE_IPV4 = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
]

const CLOUDFLARE_IPV6 = [
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
]

const cloudflare = new BlockList()
for (const range of CLOUDFLARE_IPV4) {
  const [network, prefix] = range.split('/')
  cloudflare.addSubnet(network!, Number(prefix), 'ipv4')
}
for (const range of CLOUDFLARE_IPV6) {
  const [network, prefix] = range.split('/')
  cloudflare.addSubnet(network!, Number(prefix), 'ipv6')
}

/**
 * `true`, když adresa patří Cloudflare. Přijímá i IPv4 zapsanou jako
 * IPv6 (`::ffff:162.158.0.1`), jak ji někdy vrací proxy; neplatný vstup
 * je `false`.
 */
export function isCloudflareIp(ip: string): boolean {
  const address = ip.startsWith('::ffff:') ? ip.slice('::ffff:'.length) : ip
  const family = isIP(address)
  if (family === 0) return false
  return cloudflare.check(address, family === 4 ? 'ipv4' : 'ipv6')
}
