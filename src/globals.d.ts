type AnyObject = Record<string, any>

type ModuleID = string & { feature: true }

type ModuleMeta = {
  id: ModuleID
  name: string
  description: string
}
