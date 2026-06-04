const API_MESSAGES: Record<string, string> = {
  // Auth
  'Invalid Access Token':           'Email ou mot de passe incorrect.',
  'invalid or expired token':       'Votre session a expiré, veuillez vous reconnecter.',
  'Unauthorized':                   'Vous devez être connecté pour effectuer cette action.',
  'Access Forbidden':               'Vous n\'avez pas les droits pour effectuer cette action.',
  'No enough permissions':          'Vous n\'avez pas les droits pour effectuer cette action.',

  // Ressources
  'Ressource non trouvée':          'Cette ressource est introuvable.',
  'Not Found':                      'Cette ressource est introuvable.',
  'Restaurant non trouvé':          'Ce restaurant est introuvable.',
  'Plat non trouvé':                'Ce plat est introuvable.',
  'Commande non trouvée':           'Cette commande est introuvable.',
  'Aucun restaurant associé':       'Aucun restaurant n\'est associé à votre compte.',

  // Création / conflit
  'Un utilisateur avec cet email existe déjà': 'Cette adresse email est déjà utilisée.',
  'Conflict':                       'Une ressource avec ces informations existe déjà.',

  // Réseau
  'Failed to fetch':                'Impossible de contacter le serveur. Vérifiez votre connexion.',
  'Network Error':                  'Impossible de contacter le serveur. Vérifiez votre connexion.',
  'fetch failed':                   'Impossible de contacter le serveur. Vérifiez votre connexion.',

  // Validation
  'Bad Request':                    'Les données saisies sont invalides.',
  'Validation Error':               'Certains champs sont invalides, veuillez vérifier votre saisie.',
}

const HTTP_STATUS: Record<number, string> = {
  400: 'Les données saisies sont invalides.',
  401: 'Email ou mot de passe incorrect.',
  403: 'Vous n\'avez pas les droits pour effectuer cette action.',
  404: 'Cette ressource est introuvable.',
  409: 'Une ressource avec ces informations existe déjà.',
  500: 'Une erreur est survenue côté serveur. Veuillez réessayer.',
  503: 'Le serveur est temporairement indisponible. Veuillez réessayer dans quelques instants.',
}

export function friendlyError(e: unknown, fallback = 'Une erreur inattendue est survenue.'): string {
  if (!e) return fallback

  const err = e as any

  // HTTP status code
  const status = err?.statusCode ?? err?.status ?? err?.response?.status
  if (status && HTTP_STATUS[status]) return HTTP_STATUS[status]

  // RFC 7807 detail field
  const detail = err?.detail ?? err?.data?.detail
  if (detail) {
    for (const [key, msg] of Object.entries(API_MESSAGES)) {
      if (String(detail).toLowerCase().includes(key.toLowerCase())) return msg
    }
    return String(detail)
  }

  // message field
  const message = err?.message ?? err?.data?.message ?? (typeof err === 'string' ? err : null)
  if (message) {
    // Ignore technical messages like "Route GET:/api/... not found"
    if (/^Route (GET|POST|PUT|PATCH|DELETE):/i.test(message)) {
      return HTTP_STATUS[status ?? 404] ?? fallback
    }
    for (const [key, msg] of Object.entries(API_MESSAGES)) {
      if (String(message).toLowerCase().includes(key.toLowerCase())) return msg
    }
    return String(message)
  }

  return fallback
}
