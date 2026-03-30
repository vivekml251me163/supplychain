import { relations } from "drizzle-orm/relations";
import { keywords, keywordRules, users, assignments, news, shipwayResults, weather } from "./schema";

export const keywordRulesRelations = relations(keywordRules, ({one}) => ({
	keyword: one(keywords, {
		fields: [keywordRules.keywordId],
		references: [keywords.id]
	}),
}));

export const keywordsRelations = relations(keywords, ({many}) => ({
	keywordRules: many(keywordRules),
}));

export const assignmentsRelations = relations(assignments, ({one}) => ({
	user_managerId: one(users, {
		fields: [assignments.managerId],
		references: [users.id],
		relationName: "assignments_managerId_users_id"
	}),
	user_driverId: one(users, {
		fields: [assignments.driverId],
		references: [users.id],
		relationName: "assignments_driverId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	assignments_managerId: many(assignments, {
		relationName: "assignments_managerId_users_id"
	}),
	assignments_driverId: many(assignments, {
		relationName: "assignments_driverId_users_id"
	}),
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

export const weatherRelations = relations(weather, ({many}) => ({
	shipwayResults: many(shipwayResults),
}));