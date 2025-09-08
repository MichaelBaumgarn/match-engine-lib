import { describe, it, expect } from "vitest";
import { InMemoryLobbyStore } from "../src/store/InMemoryLobbyStore";
import { LobbyQueryService } from "../src/application/LobbyQueryService";

// Mock LobbyService since the tests are having import issues
class MockLobbyService {
  public id: string;
  public createdBy: { id: string };
  public status: string;
  public startAt: Date;
  public club: { id: string } | null;
  public maxPlayersBySide: number;
  public leftSideSlots: any[] = [];
  public rightSideSlots: any[] = [];

  constructor(data: any) {
    this.id = data.id;
    this.createdBy = data.createdBy;
    this.status = data.status || "open";
    this.startAt = data.startAt;
    this.club = data.club || null;
    this.maxPlayersBySide = data.maxPlayersBySide || 2;
  }
}

describe("Lobby QueryBuilder Filters", () => {
  it("should filter lobbies by status", async () => {
    const store = new InMemoryLobbyStore();
    
    // Add mock lobbies with different statuses
    const lobby1 = new MockLobbyService({
      id: "1",
      createdBy: { id: "player1" },
      status: "open",
      startAt: new Date("2025-01-01T10:00:00Z")
    });
    
    const lobby2 = new MockLobbyService({
      id: "2", 
      createdBy: { id: "player2" },
      status: "confirmed",
      startAt: new Date("2025-01-01T11:00:00Z")
    });

    await store.saveLobby(lobby1 as any);
    await store.saveLobby(lobby2 as any);

    // Filter by open status
    const openLobbies = await store.listLobbies({ status: "open" });
    expect(openLobbies).toHaveLength(1);
    expect(openLobbies[0].id).toBe("1");

    // Filter by confirmed status
    const confirmedLobbies = await store.listLobbies({ status: "confirmed" });
    expect(confirmedLobbies).toHaveLength(1);
    expect(confirmedLobbies[0].id).toBe("2");
  });

  it("should filter lobbies by clubId", async () => {
    const store = new InMemoryLobbyStore();
    
    const lobby1 = new MockLobbyService({
      id: "1",
      createdBy: { id: "player1" },
      startAt: new Date("2025-01-01T10:00:00Z"),
      club: { id: "club1" }
    });
    
    const lobby2 = new MockLobbyService({
      id: "2",
      createdBy: { id: "player2" },
      startAt: new Date("2025-01-01T11:00:00Z"),
      club: { id: "club2" }
    });

    await store.saveLobby(lobby1 as any);
    await store.saveLobby(lobby2 as any);

    const club1Lobbies = await store.listLobbies({ clubId: "club1" });
    expect(club1Lobbies).toHaveLength(1);
    expect(club1Lobbies[0].id).toBe("1");
  });

  it("should filter lobbies by date range", async () => {
    const store = new InMemoryLobbyStore();
    
    const lobby1 = new MockLobbyService({
      id: "1",
      createdBy: { id: "player1" },
      startAt: new Date("2025-01-01T10:00:00Z")
    });
    
    const lobby2 = new MockLobbyService({
      id: "2",
      createdBy: { id: "player2" },
      startAt: new Date("2025-01-05T10:00:00Z")
    });

    await store.saveLobby(lobby1 as any);
    await store.saveLobby(lobby2 as any);

    // Filter after January 2nd
    const afterLobbies = await store.listLobbies({ 
      startAfter: new Date("2025-01-02T00:00:00Z") 
    });
    expect(afterLobbies).toHaveLength(1);
    expect(afterLobbies[0].id).toBe("2");

    // Filter before January 2nd
    const beforeLobbies = await store.listLobbies({ 
      startBefore: new Date("2025-01-02T00:00:00Z") 
    });
    expect(beforeLobbies).toHaveLength(1);
    expect(beforeLobbies[0].id).toBe("1");
  });

  it("should filter for available lobbies only", async () => {
    const store = new InMemoryLobbyStore();
    
    const fullLobby = new MockLobbyService({
      id: "1",
      createdBy: { id: "player1" },
      startAt: new Date("2025-01-01T10:00:00Z"),
      maxPlayersBySide: 1
    });
    // Mock full slots
    fullLobby.leftSideSlots = [{ id: "player1" }];
    fullLobby.rightSideSlots = [{ id: "player2" }];
    
    const availableLobby = new MockLobbyService({
      id: "2",
      createdBy: { id: "player3" },
      startAt: new Date("2025-01-01T11:00:00Z"),
      maxPlayersBySide: 2
    });
    // Mock partial slots (has availability)
    availableLobby.leftSideSlots = [{ id: "player3" }];
    availableLobby.rightSideSlots = [];

    await store.saveLobby(fullLobby as any);
    await store.saveLobby(availableLobby as any);

    const availableLobbies = await store.listLobbies({ availableOnly: true });
    expect(availableLobbies).toHaveLength(1);
    expect(availableLobbies[0].id).toBe("2");
  });

  it("should return sorted lobbies by startAt", async () => {
    const store = new InMemoryLobbyStore();
    
    const lobby1 = new MockLobbyService({
      id: "1",
      createdBy: { id: "player1" },
      startAt: new Date("2025-01-03T10:00:00Z")
    });
    
    const lobby2 = new MockLobbyService({
      id: "2",
      createdBy: { id: "player2" },
      startAt: new Date("2025-01-01T10:00:00Z")
    });

    const lobby3 = new MockLobbyService({
      id: "3",
      createdBy: { id: "player3" },
      startAt: new Date("2025-01-02T10:00:00Z")
    });

    await store.saveLobby(lobby1 as any);
    await store.saveLobby(lobby2 as any);
    await store.saveLobby(lobby3 as any);

    const sortedLobbies = await store.listLobbies();
    expect(sortedLobbies.map(l => l.id)).toEqual(["2", "3", "1"]);
  });

  it("should use LobbyQueryService for filtering", () => {
    const mockLobbies = [
      new MockLobbyService({
        id: "1",
        createdBy: { id: "player1" },
        status: "open",
        startAt: new Date("2025-01-01T10:00:00Z"),
        club: { id: "club1" }
      }),
      new MockLobbyService({
        id: "2", 
        createdBy: { id: "player2" },
        status: "confirmed",
        startAt: new Date("2025-01-01T11:00:00Z"),
        club: { id: "club2" }
      })
    ];

    // Test the static method directly
    const filteredLobbies = LobbyQueryService.filterInMemoryLobbies(
      mockLobbies as any[], 
      { status: "open", clubId: "club1" }
    );

    expect(filteredLobbies).toHaveLength(1);
    expect(filteredLobbies[0].id).toBe("1");
    expect(filteredLobbies[0].status).toBe("open");
  });
});