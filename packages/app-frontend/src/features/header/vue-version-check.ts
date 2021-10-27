import { ref, onMounted } from '@vue/composition-api'
import semver from 'semver'

const packageData = ref<any>(null)

export function useVueVersionCheck () {
  onMounted(async () => {
    if (!packageData.value) {
      try {
        const response = await fetch('https://registry.npmjs.org/vue', {
          headers: {
            mode: 'no-cors',
          },
        })
        const data = await response.json()
        packageData.value = data
      } catch (e) {
        if (process.env.NODE_ENV !== 'development') {
          console.error(e)
        }
      }
    }
  })

  function getLatestVersion (currentVersion: string): string {
    if (packageData.value && packageData.value.versions) {
      return semver.maxSatisfying(Object.keys(packageData.value.versions), `^${currentVersion}`)
    }
    return currentVersion
  }

  return {
    getLatestVersion,
  }
}
