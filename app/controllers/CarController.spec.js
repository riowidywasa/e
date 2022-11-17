const CarController = require("./CarController");
const { Car, UserCar } = require("../models");
const { Op } = require("sequelize");
const { CarAlreadyRentedError } = require("../errors");
const dayjs = require("dayjs");

describe("CarController", () => {
    describe("constructor", () => {
        it("should set the carModel", () => {
            const carModel = {};
            const userCarModel = {};
            const dayjs = {};
            const controller = new CarController({ carModel, userCarModel, dayjs });

            expect(controller.carModel).toBe(carModel);
        });
    });

    // ListCars
    describe("handleListCars", () => {
        // return a list of cars
        it("should return list cars", async () => {
            const name = "Mazda RX-";
            const price = "300000";
            const size = "SMALL";
            const image = "https://source.unsplash.com/500x500";
            const isCurrentlyRented = false;
            const createdAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
            const updatedAt = dayjs().format("YYYY-MM-DD HH:mm:ss");

            const cars = [];

            for (let i = 0; i < 5; i++) {
                const car = new Car({
                    name: `${name}${i}`,
                    price,
                    size,
                    image,
                    isCurrentlyRented,
                    createdAt,
                    updatedAt,
                });
                cars.push(car);
            }

            const mockCarModel = {
                findAll: jest.fn().mockReturnValue(cars),
                count: jest.fn().mockReturnValue(5),
            };

            const mockUserCar = new UserCar({
                userId: 1,
                carId: 1,
            });

            const carController = new CarController({
                carModel: mockCarModel,
                userCarModel: mockUserCar,
                dayjs,
            });

            const mockRequest = {
                query: {},
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await carController.handleListCars(mockRequest, mockResponse);

            expect(mockCarModel.findAll).toHaveBeenCalled();
            expect(mockCarModel.count).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                cars,
                meta: {
                    pagination: {
                        page: 1,
                        pageCount: 1,
                        pageSize: 10,
                        count: 5,
                    },
                },
            });
        });
    });
    // end ListCars

    // GetCar
    describe("handleGetCar", () => {
        // return a car
        it("should return car", async () => {
            const mockCar = new Car({
                id: 1,
                name: "Mazda RX-1",
                price: "300000",
                size: "SMALL",
                image: "https://source.unsplash.com/500x500",
                isCurrentlyRented: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const mockCarModel = {
                findByPk: jest.fn().mockReturnValue(mockCar),
            };

            const mockUserCar = new UserCar({
                userId: 1,
                carId: 1,
                rentStartedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                rentEndedAt: dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss"),
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });

            const mockRequest = {
                params: {
                    id: 1,
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const carController = new CarController({
                carModel: mockCarModel,
                userCarModel: mockUserCar,
                dayjs,
            });

            await carController.handleGetCar(mockRequest, mockResponse);

            expect(mockCarModel.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
        });
    });
    // end GetCar

    // CreateCar
    describe("handleCreateCar", () => {
        // create a car
        it("should create car and status 201 ", async () => {
            const mockCar = new Car({
                name: "Mazda RX-1",
                price: "300000",
                size: "SMALL",
                image: "https://source.unsplash.com/500x500",
                isCurrentlyRented: false,
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });

            const mockCarModel = {
                create: jest.fn().mockReturnValue(mockCar),
            };

            const mockRequest = {
                body: {
                    name: "Mazda RX-1",
                    price: "300000",
                    size: "SMALL",
                    image: "https://source.unsplash.com/500x500",
                    isCurrentlyRented: false,
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const carController = new CarController({
                carModel: mockCarModel,
                dayjs,
            });

            await carController.handleCreateCar(mockRequest, mockResponse);

            expect(mockCarModel.create).toHaveBeenCalledWith(mockRequest.body);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mockCar);
        });
        // end create a car

        // create a car with invalid data
        it("should return error", async () => {
            const mockCarModel = {
                create: jest.fn().mockImplementation(() => {
                    throw new Error("error");
                }),
            };

            const mockRequest = {
                body: {
                    name: "Mazda RX-1",
                    price: "300000",
                    size: "SMALL",
                    image: "https://source.unsplash.com/500x500",
                    isCurrentlyRented: false,
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const carController = new CarController({
                carModel: mockCarModel,
                dayjs,
            });

            await carController.handleCreateCar(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(422);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: {
                    name: expect.any(String),
                    message: expect.any(String),
                },
            });
        });
        // end create a car with invalid data
    });
    // end CreateCar

    // handlerentCar
    describe("handleRentCar", () => {
        // rent a car
        it("should rent a car", async () => {
            const mockCar = new Car({
                name: "Mazda RX-1",
                price: "300000",
                size: "SMALL",
                image: "https://source.unsplash.com/500x500",
                isCurrentlyRented: false,
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });

            const mockUserCar = new UserCar({
                userId: 5,
                carId: 1,
                rentStartedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                rentEndedAt: dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss"),
            });

            const mockCarModel = {
                findByPk: jest.fn().mockReturnValue(mockCar),
            };

            const mockUserCarModel = {
                findOne: jest.fn().mockReturnValue(null),
                create: jest.fn().mockReturnValue({
                    userId: mockUserCar.userId,
                    carId: mockUserCar.carId,
                    rentStartedAt: mockUserCar.rentStartedAt,
                    rentEndedAt: mockUserCar.rentEndedAt,
                }),
            };

            const mockRequest = {
                body: {
                    rentStartedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    rentEndedAt: dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss"),
                },
                params: {
                    id: 1,
                },
                user: {
                    id: 5,
                },
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const mockNext = jest.fn();

            const carController = new CarController({
                carModel: mockCarModel,
                userCarModel: mockUserCarModel,
                dayjs,
            });

            await carController.handleRentCar(mockRequest, mockResponse, mockNext);

            expect(mockCarModel.findByPk).toHaveBeenCalledWith(mockRequest.params.id);
            expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
                where: {
                    carId: mockCar.id,
                    rentStartedAt: {
                        [Op.gte]: mockRequest.body.rentStartedAt,
                    },
                    rentEndedAt: {
                        [Op.lte]: mockRequest.body.rentEndedAt,
                    },
                },
            });
            expect(mockUserCarModel.create).toHaveBeenCalledWith({
                userId: mockRequest.user.id,
                carId: mockCar.id,
                rentStartedAt: mockRequest.body.rentStartedAt,
                rentEndedAt: mockRequest.body.rentEndedAt,
            });
        });

        it("should return error status 422", async () => {
            const mockCar = new Car({
                name: "Mazda RX-1",
                price: "300000",
                size: "SMALL",
                image: "https://source.unsplash.com/500x500",
                isCurrentlyRented: false,
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });

            const mockUserCar = new UserCar({
                userId: 5,
                carId: 1,
                rentStartedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                rentEndedAt: dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss"),
            });

            const mockCarModel = {
                findByPk: jest.fn().mockReturnValue(mockCar),
            };

            const mockUserCarModel = {
                findOne: jest.fn().mockReturnValue(mockUserCar),
            };

            const mockRequest = {
                body: {
                    rentStartedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    rentEndedAt: dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss"),
                },
                params: {
                    id: 1,
                },
                user: {
                    id: 5,
                },
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const mockNext = jest.fn();

            const carController = new CarController({
                carModel: mockCarModel,
                userCarModel: mockUserCarModel,
                dayjs,
            });

            const error = new CarAlreadyRentedError(mockCar);

            await carController.handleRentCar(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(422);
            expect(mockResponse.json).toHaveBeenCalledWith(error);
        });
    });
    // end rent a car

    // deleteCar
    describe("handleDeleteCar", () => {
        // delete a car
        it("should delete a car", async () => {
            const mockCarModel = {
                destroy: jest.fn().mockReturnValue(1),
            };

            const mockRequest = {
                params: {
                    id: 1,
                },
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
                end: jest.fn().mockReturnThis(),
            };

            const carController = new CarController({
                carModel: mockCarModel,
                dayjs,
            });

            await carController.handleDeleteCar(mockRequest, mockResponse);

            expect(mockCarModel.destroy).toHaveBeenCalledWith(mockRequest.params.id);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.end).toHaveBeenCalled();
        });
        // end delete a car
    });
    // end deleteCar

    // updateCar
    describe("handleUpdateCar", () => {
        it("should and return updated car on success and status 200", async () => {
            const defaultMockCar = {
                'id': 1,
                'name': 'Mazda RX4 Wag',
                'price': 300000,
                'size': 'LARGE',
                'image': 'https://source.unsplash.com/501x501',
                'isCurrentlyRented': false,
                'createdAt': '2022-11-14T05:11:01.429Z',
                'updatedAt': '2022-11-14T05:11:01.429Z',
                'userCar': null,
            };
            const mockCarReq = {
                name: defaultMockCar.name,
                price: defaultMockCar.price,
                size: defaultMockCar.size,
                image: defaultMockCar.image,
                isCurrentlyRented: defaultMockCar.isCurrentlyRented,
            };
            const mockReq = {
                body: mockCarReq,
                params: {
                    id: 1,
                },
            };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const mockCarModel = {
                findByPk: jest.fn().mockReturnValue(defaultMockCar),
                update: jest.fn().mockReturnThis(),
            };
            const mockUserCarModel = {};

            const controller = new CarController({
                carModel: mockCarModel,
                userCarModel: mockUserCarModel,
                dayjs,
            });

            await controller.handleUpdateCar(mockReq, mockRes);

            expect(mockCarModel.findByPk).toHaveBeenCalled();
            expect(mockCarModel.update).toHaveBeenCalledWith(
                mockCarReq, 
                { where: { id: mockReq.params.id } }
                );
            expect(mockRes.status).toHaveBeenCalledWith(200);


        });

        // update error
        it("should return error", async () => {
            const mockCarModel = {
                update: jest.fn().mockImplementation(() => {
                    throw new Error("error");
                }),
            };

            const mockRequest = {
                params: {
                    id: 1,
                },
                body: {
                    name: "Mazda RX-1",
                    price: "300000",
                    size: "SMALL",
                    image: "https://source.unsplash.com/500x500",
                    isCurrentlyRented: false,
                },
            };

            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            const carController = new CarController({
                carModel: mockCarModel,
                dayjs,
            });

            await carController.handleUpdateCar(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(422);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: {
                    name: expect.any(String),
                    message: expect.any(String),
                },
            });
        });
        // end update error
    });
    // end update a car

    // get car by id
    describe("getCarFromRequest", () => {
        it("should return a car by pk", () => {
            const mockCar = new Car({
                id: 1,
                name: "Mazda RX-1",
                price: "300000",
                size: "SMALL",
                image: "https://source.unsplash.com/500x500",
                isCurrentlyRented: false,
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });

            mockCarModel = {
                findByPk: jest.fn().mockReturnValue(mockCar),
            };

            const mockRequest = {
                params: {
                    id: 1,
                },
            };

            const carController = new CarController({
                carModel: mockCarModel,
                dayjs,
            });

            const car = carController.getCarFromRequest(mockRequest);

            expect(car).toEqual(mockCar);
        });
    });
    // end get car by id
});
