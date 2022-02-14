export interface Job {
  id: string
  fn: () => Promise<void>
}

export class JobQueue {
  jobs: Job[] = []
  currentJob: Job

  queue (id: string, fn: Job['fn']) {
    const job: Job = {
      id,
      fn,
    }

    return new Promise<void>(resolve => {
      const onDone = () => {
        this.currentJob = null
        const nextJob = this.jobs.shift()
        if (nextJob) {
          nextJob.fn()
        }
        resolve()
      }

      const run = () => {
        this.currentJob = job
        return job.fn().then(onDone).catch(e => {
          console.error(`Job ${job.id} failed:`)
          console.error(e)
        })
      }

      if (this.currentJob) {
        this.jobs.push({
          id: job.id,
          fn: () => run(),
        })
      } else {
        run()
      }
    })
  }
}
