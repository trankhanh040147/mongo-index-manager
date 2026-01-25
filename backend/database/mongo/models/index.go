package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Index struct {
	CreatedAt    time.Time          `bson:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at"`
	Options      IndexOption        `bson:"options"`
	Collection   string             `bson:"collection"`
	Name         string             `bson:"name"`
	KeySignature string             `bson:"key_signature"`
	Keys         []IndexKey         `bson:"keys"`
	IsText       bool               `bson:"is_text"`
	DatabaseId   primitive.ObjectID `bson:"database_id"`
	Id           primitive.ObjectID `bson:"_id,omitempty"`
}

type Collation struct {
	Strength        *int   `bson:"strength,omitempty" json:"strength,omitempty"`
	CaseLevel       *bool  `bson:"case_level,omitempty" json:"case_level,omitempty"`
	NumericOrdering *bool  `bson:"numeric_ordering,omitempty" json:"numeric_ordering,omitempty"`
	Locale          string `bson:"locale" json:"locale"`
	CaseFirst       string `bson:"case_first,omitempty" json:"case_first,omitempty"`
}

type IndexOption struct {
	ExpireAfterSeconds *int32                 `bson:"expire_after_seconds"`
	Collation          *Collation             `bson:"collation,omitempty"`
	Weights            map[string]interface{} `bson:"weights,omitempty"`
	DefaultLanguage    string                 `bson:"default_language,omitempty"`
	IsUnique           bool                   `bson:"is_unique"`
}

type IndexKey struct {
	Value interface{} `bson:"value"`
	Field string      `bson:"field"`
}

func IsTextIndex(keys []IndexKey) bool {
	for _, key := range keys {
		if v, ok := key.Value.(string); ok && v == "text" {
			return true
		}
	}
	return false
}

func (m *Index) GetKeySignature() string {
	if len(m.Keys) == 0 {
		return ""
	}
	var keyString string
	if !m.IsText {
		for _, key := range m.Keys {
			if key.Field == "_fts" || key.Field == "_ftsx" {
				continue
			}
			switch v := key.Value.(type) {
			case int32:
				keyString += fmt.Sprintf("%s_%d_", key.Field, v)
			case string:
				if v == "text" {
					keyString += fmt.Sprintf("%s_text_", key.Field)
				} else {
					keyString += fmt.Sprintf("%s_%s_", key.Field, v)
				}
			default:
				keyString += fmt.Sprintf("%s_%v_", key.Field, v)
			}
		}
	} else {
		keyString += "text_"
		if m.Options.DefaultLanguage != "" {
			keyString += fmt.Sprintf("default_language_%s_", m.Options.DefaultLanguage)
		}
		if m.Options.Weights != nil {
			for k, v := range m.Options.Weights {
				keyString += fmt.Sprintf("weights_%s_%v_", k, v)
			}
		}
	}
	if m.Options.Collation != nil && m.Options.Collation.Locale != "" {
		keyString += fmt.Sprintf("collation_locale_%s_", m.Options.Collation.Locale)
		if m.Options.Collation.Strength != nil {
			keyString += fmt.Sprintf("strength_%d_", *m.Options.Collation.Strength)
		}
	}
	if m.Options.IsUnique {
		keyString += "unique_"
	}
	if m.Options.ExpireAfterSeconds != nil {
		keyString += fmt.Sprintf("expireAfterSeconds_%d", *m.Options.ExpireAfterSeconds)
	}
	return keyString
}

func (m *Index) CollectionName() string {
	return "indexes"
}
