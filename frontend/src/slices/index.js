import {combineReducers} from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication
import LoginReducer from "./auth/login/reducer";
import AccountReducer from "./auth/register/reducer";
import ForgetPasswordReducer from "./auth/forgetpwd/reducer";
import ProfileReducer from "./auth/profile/reducer";

//Calendar
import CalendarReducer from "./calendar/reducer";
//Chat
import chatReducer from "./chat/reducer";
//Project
import ProjectsReducer from "./projects/reducer";

import DatabaseReducer from "./database/reducer";

import CollectionReducer from "./collection/reducer";
import IndexReducer from "./index/reducer";
import SyncReducer from "./sync/reducer";


// Tasks
import TasksReducer from "./tasks/reducer";

//TicketsList
import TicketsReducer from "./tickets/reducer";
//Crm
import CrmReducer from "./crm/reducer";

//Mailbox
import MailboxReducer from "./mailbox/reducer";
// Dashboard CRM
import DashboardCRMReducer from "./dashboardCRM/reducer";

import DashboardProjectReducer from "./dashboardProject/reducer";
// Pages > Team
import TeamDataReducer from "./team/reducer";
// To do
import TodosReducer from "./todos/reducer";
// API Key
import APIKeyReducer from "./apiKey/reducer";

const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Login: LoginReducer,
    Account: AccountReducer,
    ForgetPassword: ForgetPasswordReducer,
    Profile: ProfileReducer,
    Calendar: CalendarReducer,
    Chat: chatReducer,
    Projects: ProjectsReducer,
    Databases: DatabaseReducer,
    Collections: CollectionReducer,
    Indexes: IndexReducer,
    Syncs: SyncReducer,
    Tasks: TasksReducer,
    Tickets: TicketsReducer,
    Crm: CrmReducer,
    Mailbox: MailboxReducer,
    DashboardCRM: DashboardCRMReducer,
    DashboardProject: DashboardProjectReducer,
    Team: TeamDataReducer,
    Todos: TodosReducer,
    APIKey: APIKeyReducer
});

export default rootReducer;