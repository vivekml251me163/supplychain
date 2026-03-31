import { relations } from "drizzle-orm/relations";
import { keywords, keywordRules, users, shipReroutes, weather, weatherResults, news, shipwayResults } from "./schema";

export const keywordRulesRelations = relations(keywordRules, ({one}) => ({
	keyword: one(keywords, {
		fields: [keywordRules.keywordId],
		references: [keywords.id]
	}),
}));

export const keywordsRelations = relations(keywords, ({many}) => ({
	keywordRules: many(keywordRules),
}));

export const shipReroutesRelations = relations(shipReroutes, ({one}) => ({
	user: one(users, {
		fields: [shipReroutes.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	shipReroutes: many(shipReroutes),
}));

export const weatherResultsRelations = relations(weatherResults, ({one}) => ({
	weather: one(weather, {
		fields: [weatherResults.weatherId],
		references: [weather.id]
	}),
}));

export const weatherRelations = relations(weather, ({many}) => ({
	weatherResults: many(weatherResults),
	shipwayResults: many(shipwayResults),
}));

export const shipwayResultsRelations = relations(shipwayResults, ({one}) => ({
	news: one(news, {
		fields: [shipwayResults.newsId],
		references: [news.id]
	}),
	weather: one(weather, {
		fields: [shipwayResults.weatherId],
		references: [weather.id]
	}),
}));

export const newsRelations = relations(news, ({many}) => ({
	shipwayResults: many(shipwayResults),
}));