import { BackendContext } from '@vue-devtools/app-backend-api'

export function getAppRecord (app: any, ctx: BackendContext) {
  return ctx.appRecords.find(ar => ar.options.app === app)
}
