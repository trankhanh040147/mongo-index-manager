package job

import (
	"doctor-manager-api/common/logging"
	"doctor-manager-api/utilities/taskqueue"
)

var logger = logging.GetLogger()

func SetupHandler(jobQueue taskqueue.Service) {
	if jobQueue == nil {
		return
	}
	jobQueue.HandleFunc(taskqueue.TaskTypeSyncIndexByCollection, handleSyncIndexByCollection)
}
