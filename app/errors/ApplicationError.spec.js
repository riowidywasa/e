const ApplicationError = require('./ApplicationError');
describe("ApplicationError", () => {
    it("should return empty", () => {
        const applicationError = new ApplicationError();
        expect(applicationError.details);
    });

    it("should return error", () => {
        const applicationError = new ApplicationError();
        expect(applicationError.toJSON());
    });
})