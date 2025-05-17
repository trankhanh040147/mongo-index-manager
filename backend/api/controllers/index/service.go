package index

type serviceInterface interface {
}

type service struct{}

func newService() serviceInterface {
	return &service{}
}
