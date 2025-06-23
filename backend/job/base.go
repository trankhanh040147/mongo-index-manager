package job

import (
	"doctor-manager-api/common/logging"
	jobqueue "doctor-manager-api/utilities/job_queue"
)

var logger = logging.GetLogger()

func SetupHandler(jobQueue jobqueue.Service) {
	if jobQueue == nil {
		return
	}
	jobQueue.HandleFunc(jobqueue.TaskTypeSyncIndexByCollection, handleSyncIndexByCollection)
}
