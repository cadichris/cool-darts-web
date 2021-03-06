const request = require("supertest");
const { makeApp } = require("../app");
const actions_in_rooms = require("./data/actions_in_rooms.json");
const { getInMemoryDbAdapter } = require("../adapters/DbAdapter.inMemory");

describe("App", () => {
  describe("POST /room/clean", () => {
    it("copie les actions pour archive, puis vide la table des actions sur POST /room/clean", (done) => {
      const dbAdapter = getInMemoryDbAdapter();
      const { copy, truncate } = dbAdapter;

      request(makeApp({ dbAdapter }))
        .post("/room/clean")
        .expect(200)
        .then(() =>
          expect(copy).toHaveBeenCalledWith({
            source: "actions_in_rooms",
            destination: "actions_in_rooms_archive",
          })
        )
        .then(() => expect(truncate).toHaveBeenCalledWith("actions_in_rooms"))
        .then(done)
        .catch((err) => done(err));
    });
  });

  describe("GET /room/actions", () => {
    it("récupère toutes les actions d'une room sur GET /room/actions", (done) => {
      const dbAdapter = {
        ...getInMemoryDbAdapter(),
        getAll: jest.fn(async () => actions_in_rooms),
      };

      request(makeApp({ dbAdapter }))
        .get("/room/actions")
        .expect(200, [{ type: "CRICKET/INSCRIRE_CRICKET", joueur: "Olive" }])
        .then(() =>
          expect(dbAdapter.getAll).toHaveBeenCalledWith(
            "actions_in_rooms",
            "action_time ASC"
          )
        )
        .then(done);
    });
  });
});
