export type Job = () => Promise<void>

export class JobQueue {
  jobs: Job[] = []
  currentJob: Job

  queue (job: Job) {
    return new Promise<void>(resolve => {
      const onDone = () => {
        this.currentJob = null
        const nextJob = this.jobs.shift()
        if (nextJob) {
          nextJob()
        }
        resolve()
      }

      const run = () => {
        this.currentJob = job
        return job().then(onDone)
      }

      if (this.currentJob) {
        this.jobs.push(() => run())
      } else {
        run()
      }
    })
  }
}
