package validator

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

var databaseUri = ValidateFunction{
	Tag: "databaseUri",
	Function: func(fl validator.FieldLevel) bool {
		fieldString := fl.Field().String()
		regex := `^mongodb:\/\/(?:[a-zA-Z0-9_-]+(?::[a-zA-Z0-9!$&'()*+,;=._-]+)?@)?(?:[a-zA-Z0-9.-]+(?::\d+)?)((?:,(?:[a-zA-Z0-9.-]+(?::\d+)?))*)(?:\/[a-zA-Z0-9_-]*)?(?:\?[a-zA-Z0-9=&_-]+)?$`
		r := regexp.MustCompile(regex)
		return r.MatchString(fieldString)
	},
}

var mongodbLanguage = ValidateFunction{
	Tag: "mongodbLanguage",
	Function: func(fl validator.FieldLevel) bool {
		fieldString := fl.Field().String()
		if fieldString == "" {
			return true
		}
		if fieldString == "none" {
			return true
		}
		// Validate ISO 639-1 two-letter language codes
		// MongoDB supports standard ISO 639-1 codes (lowercase, 2 letters)
		if len(fieldString) != 2 {
			return false
		}
		regex := regexp.MustCompile(`^[a-z]{2}$`)
		if !regex.MatchString(fieldString) {
			return false
		}
		// Common MongoDB supported languages (non-exhaustive list, but validates format)
		// MongoDB accepts any valid ISO 639-1 code
		// Common ones: da, nl, en, fi, fr, de, hu, it, nb, pt, ro, ru, es, sv, tr
		return true
	},
}
