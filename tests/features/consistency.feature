Feature: Data consistency rules enforced by the API

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  # UI pokryva v card.feature odmitnute mazani klienta s lekcemi a v lectures.feature
  # projeveni pridaneho clena skupiny; odebrani clena a odpovedi API se overuji jen tady
  @consistency @api_only @fast.row1.1
  Scenario: Removing a group member drops their attendance
    When user adds a group lecture and then removes "Jirušková Aneta" from "Slabika 4" with refresh
    Then the lecture no longer has attendance of "Jirušková Aneta"

  @consistency @api_only
  Scenario: Client with lectures cannot be deleted
    When user tries to delete the client "Rodová Petra" through the API
    Then the API refuses because the client has lectures

  @consistency @api_only
  Scenario: Missing client returns not found
    When user requests a client that does not exist
    Then the API answers not found
