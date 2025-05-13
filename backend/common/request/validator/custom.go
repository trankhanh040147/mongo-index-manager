package validator

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

var databaseUri = ValidateFunction{
	Tag: "databaseUri",
	Function: func(fl validator.FieldLevel) bool {
		fieldString := fl.Field().String()
		// mongodb://<user>:<password>@<hosts>?<params>
		regex := `^mongodb:\/\/(?:[a-zA-Z0-9_-]+(?::[a-zA-Z0-9!$&'()*+,;=._-]+)?@)?(?:[a-zA-Z0-9.-]+(?::\d+)?)((?:,(?:[a-zA-Z0-9.-]+(?::\d+)?))*)(?:\/[a-zA-Z0-9_-]*)?(?:\?[a-zA-Z0-9=&_-]+)?$`
		r := regexp.MustCompile(regex)
		return r.MatchString(fieldString)
	},
}
