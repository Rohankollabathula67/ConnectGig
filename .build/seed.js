"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function upsertSkills() {
    return __awaiter(this, void 0, void 0, function () {
        var skills, _i, skills_1, skill;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skills = [
                        { name: 'Plumbing - Pipe Repair', category: client_1.SkillCategory.PLUMBING },
                        { name: 'Plumbing - Leak Fix', category: client_1.SkillCategory.PLUMBING },
                        { name: 'Electrical - Wiring', category: client_1.SkillCategory.ELECTRICAL },
                        { name: 'Electrical - Appliance Repair', category: client_1.SkillCategory.ELECTRICAL },
                        { name: 'Carpentry - Furniture', category: client_1.SkillCategory.CARPENTRY },
                        { name: 'Cleaning - Deep Clean', category: client_1.SkillCategory.CLEANING },
                        { name: 'Delivery - Local Courier', category: client_1.SkillCategory.DELIVERY },
                    ];
                    _i = 0, skills_1 = skills;
                    _a.label = 1;
                case 1:
                    if (!(_i < skills_1.length)) return [3 /*break*/, 4];
                    skill = skills_1[_i];
                    return [4 /*yield*/, prisma.skill.upsert({
                            where: { name: skill.name },
                            update: { category: skill.category },
                            create: skill,
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createUsersAndWorkers() {
    return __awaiter(this, void 0, void 0, function () {
        var client, workersData, _i, workersData_1, w, user, worker, _a, _b, s, skill;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, prisma.user.upsert({
                        where: { email: 'client1@example.com' },
                        update: {},
                        create: {
                            name: 'Homeowner One',
                            email: 'client1@example.com',
                            phone: '+10000000001',
                            role: 'CLIENT',
                        },
                    })];
                case 1:
                    client = _c.sent();
                    workersData = [
                        {
                            user: { name: 'Ravi Kumar', email: 'ravi.plumber@example.com', phone: '+10000000011' },
                            hourlyRate: 20,
                            bio: 'Expert plumber specializing in leak fixes and pipe repairs.',
                            availability: client_1.AvailabilityStatus.AVAILABLE,
                            coords: { lat: 17.3850, lng: 78.4867 },
                            skills: [
                                { name: 'Plumbing - Leak Fix', level: client_1.SkillLevel.EXPERT },
                                { name: 'Plumbing - Pipe Repair', level: client_1.SkillLevel.INTERMEDIATE },
                            ],
                        },
                        {
                            user: { name: 'Sumanth Reddy', email: 'sumanth.elec@example.com', phone: '+10000000012' },
                            hourlyRate: 25,
                            bio: 'Licensed electrician available for wiring and appliance repair.',
                            availability: client_1.AvailabilityStatus.AVAILABLE,
                            coords: { lat: 17.4401, lng: 78.3489 },
                            skills: [
                                { name: 'Electrical - Wiring', level: client_1.SkillLevel.EXPERT },
                                { name: 'Electrical - Appliance Repair', level: client_1.SkillLevel.INTERMEDIATE },
                            ],
                        },
                        {
                            user: { name: 'Aditya Verma', email: 'aditya.carp@example.com', phone: '+10000000013' },
                            hourlyRate: 18,
                            bio: 'Carpenter focusing on furniture assembly and repair.',
                            availability: client_1.AvailabilityStatus.BUSY,
                            coords: { lat: 17.4239, lng: 78.4738 },
                            skills: [
                                { name: 'Carpentry - Furniture', level: client_1.SkillLevel.INTERMEDIATE },
                            ],
                        },
                    ];
                    _i = 0, workersData_1 = workersData;
                    _c.label = 2;
                case 2:
                    if (!(_i < workersData_1.length)) return [3 /*break*/, 11];
                    w = workersData_1[_i];
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: w.user.email },
                            update: {},
                            create: {
                                name: w.user.name,
                                email: w.user.email,
                                phone: w.user.phone,
                                role: 'WORKER',
                            },
                        })];
                case 3:
                    user = _c.sent();
                    return [4 /*yield*/, prisma.worker.upsert({
                            where: { userId: user.id },
                            update: {
                                hourlyRate: w.hourlyRate,
                                bio: w.bio,
                                availability: w.availability,
                            },
                            create: {
                                userId: user.id,
                                hourlyRate: w.hourlyRate,
                                bio: w.bio,
                                availability: w.availability,
                            },
                        })];
                case 4:
                    worker = _c.sent();
                    // Location
                    return [4 /*yield*/, prisma.workerLocation.upsert({
                            where: { workerId: worker.id },
                            update: {
                                latitude: w.coords.lat,
                                longitude: w.coords.lng,
                                address: 'Hyderabad, Telangana',
                                city: 'Hyderabad',
                                state: 'Telangana',
                                country: 'India',
                            },
                            create: {
                                workerId: worker.id,
                                latitude: w.coords.lat,
                                longitude: w.coords.lng,
                                address: 'Hyderabad, Telangana',
                                city: 'Hyderabad',
                                state: 'Telangana',
                                country: 'India',
                            },
                        })];
                case 5:
                    // Location
                    _c.sent();
                    _a = 0, _b = w.skills;
                    _c.label = 6;
                case 6:
                    if (!(_a < _b.length)) return [3 /*break*/, 10];
                    s = _b[_a];
                    return [4 /*yield*/, prisma.skill.findUnique({ where: { name: s.name } })];
                case 7:
                    skill = _c.sent();
                    if (!skill) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.workerSkill.upsert({
                            where: { workerId_skillId: { workerId: worker.id, skillId: skill.id } },
                            update: { level: s.level, verified: true },
                            create: { workerId: worker.id, skillId: skill.id, level: s.level, verified: true },
                        })];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 6];
                case 10:
                    _i++;
                    return [3 /*break*/, 2];
                case 11: return [2 /*return*/, { client: client }];
            }
        });
    });
}
function createJobs(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var jobs, _i, jobs_1, j, job;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jobs = [
                        {
                            title: 'Fix kitchen sink leak',
                            description: 'Water leaking under the sink, need urgent fix',
                            category: client_1.SkillCategory.PLUMBING,
                            price: 1200,
                            status: client_1.JobStatus.PENDING,
                            urgency: client_1.UrgencyLevel.URGENT,
                            location: { lat: 17.385, lng: 78.4867, address: 'Banjara Hills, Hyderabad' },
                        },
                        {
                            title: 'Install ceiling fan',
                            description: 'Require wiring and installation for a ceiling fan',
                            category: client_1.SkillCategory.ELECTRICAL,
                            price: 900,
                            status: client_1.JobStatus.PENDING,
                            urgency: client_1.UrgencyLevel.MEDIUM,
                            location: { lat: 17.44, lng: 78.3489, address: 'Gachibowli, Hyderabad' },
                        },
                        {
                            title: 'Repair wooden chair',
                            description: 'One leg is loose, needs fixing',
                            category: client_1.SkillCategory.CARPENTRY,
                            price: 500,
                            status: client_1.JobStatus.PENDING,
                            urgency: client_1.UrgencyLevel.LOW,
                            location: { lat: 17.4239, lng: 78.4738, address: 'Hitech City, Hyderabad' },
                        },
                    ];
                    _i = 0, jobs_1 = jobs;
                    _a.label = 1;
                case 1:
                    if (!(_i < jobs_1.length)) return [3 /*break*/, 5];
                    j = jobs_1[_i];
                    return [4 /*yield*/, prisma.job.create({
                            data: {
                                clientId: clientId,
                                title: j.title,
                                description: j.description,
                                category: j.category,
                                price: j.price,
                                status: j.status,
                                urgency: j.urgency,
                            },
                        })];
                case 2:
                    job = _a.sent();
                    return [4 /*yield*/, prisma.jobLocation.create({
                            data: {
                                jobId: job.id,
                                latitude: j.location.lat,
                                longitude: j.location.lng,
                                address: j.location.address,
                                city: 'Hyderabad',
                                state: 'Telangana',
                                country: 'India',
                            },
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding database with sample data...');
                    return [4 /*yield*/, upsertSkills()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, createUsersAndWorkers()];
                case 2:
                    client = (_a.sent()).client;
                    return [4 /*yield*/, createJobs(client.id)];
                case 3:
                    _a.sent();
                    console.log('✅ Seeding complete');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
