package mongodb

import (
	"context"
	"fmt"
	"slices"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"doctor-manager-api/common/logging"
)

const defaultContextTimeout = 20 * time.Second

var logger = logging.GetLogger()

type Service interface {
	TestConnection(uri string) error
	GetIndexesByDbNameAndCollections(dbName string, collections []string) (indexes []Index, err error)
	GetIndexesByDbName(dbName string) (indexes []Index, err error)
	RemoveIndexes(dbName string, indexes []Index) error
	CreateIndexes(dbName string, indexes []Index) error
	CreateCollection(dbName string, collectionName string) error
}
type service struct {
	client *mongo.Client
}

type Index struct {
	CreatedAt    time.Time   `bson:"created_at"`
	UpdatedAt    time.Time   `bson:"updated_at"`
	Options      IndexOption `bson:"options"`
	Collection   string      `bson:"collection"`
	Name         string      `bson:"name"`
	KeySignature string      `bson:"key_signature"`
	Keys         []IndexKey  `bson:"keys"`
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

func (m *Index) GetKeySignature() string {
	if len(m.Keys) == 0 {
		return ""
	}
	var keyString string
	hasTextIndex := false
	keys := m.Keys
	slices.SortFunc(m.Keys, func(keyFirst, keySecond IndexKey) int {
		return strings.Compare(keyFirst.Field, keySecond.Field)
	})
	for _, key := range keys {
		switch v := key.Value.(type) {
		case int32:
			keyString += fmt.Sprintf("%s_%d_", key.Field, v)
		case string:
			if v == "text" {
				keyString += fmt.Sprintf("%s_text_", key.Field)
				hasTextIndex = true
			} else {
				keyString += fmt.Sprintf("%s_%s_", key.Field, v)
			}
		default:
			keyString += fmt.Sprintf("%s_%v_", key.Field, v)
		}
	}
	if hasTextIndex {
		keyString += "text_"
		if m.Options.DefaultLanguage != "" {
			keyString += fmt.Sprintf("default_language_%s_", m.Options.DefaultLanguage)
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

func (m *Index) toIndexModel() mongo.IndexModel {
	keys := bson.D{}
	for _, key := range m.Keys {
		keys = append(keys, bson.E{Key: key.Field, Value: key.Value})
	}
	result := mongo.IndexModel{
		Keys:    keys,
		Options: options.Index(),
	}
	if m.Options.ExpireAfterSeconds != nil {
		result.Options.SetExpireAfterSeconds(*m.Options.ExpireAfterSeconds)
	}
	if m.Options.IsUnique {
		result.Options.SetUnique(m.Options.IsUnique)
	}
	if m.Options.Collation != nil && m.Options.Collation.Locale != "" {
		collation := options.Collation{
			Locale: m.Options.Collation.Locale,
		}
		if m.Options.Collation.Strength != nil {
			collation.Strength = *m.Options.Collation.Strength
		}
		if m.Options.Collation.CaseLevel != nil {
			collation.CaseLevel = *m.Options.Collation.CaseLevel
		}
		if m.Options.Collation.CaseFirst != "" {
			collation.CaseFirst = m.Options.Collation.CaseFirst
		}
		if m.Options.Collation.NumericOrdering != nil {
			collation.NumericOrdering = *m.Options.Collation.NumericOrdering
		}
		result.Options.SetCollation(&collation)
	}
	if m.Options.DefaultLanguage != "" {
		result.Options.SetDefaultLanguage(m.Options.DefaultLanguage)
	}
	if m.Options.Weights != nil && len(m.Options.Weights) > 0 {
		result.Options.SetWeights(m.Options.Weights)
	}
	return result
}

func New(uri string) (Service, error) {
	opts := options.Client()
	opts.ApplyURI(uri)
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		logger.Error().Err(err).Str("function", "New").Str("functionInline", "mongo.Connect").Msg("mongodb")
		return nil, err
	}
	ctxPing, cancelPing := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancelPing()
	if err = client.Ping(ctxPing, nil); err != nil {
		logger.Error().Err(err).Str("function", "New").Str("functionInline", "client.Ping").Msg("mongodb")
		return nil, err
	}
	return &service{
		client: client,
	}, nil
}
