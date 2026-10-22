Feature: Navigation, missing pages and list filters

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  @navigation @ui_only @fast.row1.1
  Scenario: Menu opens every section
    When user opens every section from the menu
    Then each section shows its title

  @navigation @ui_only
  Scenario: Unknown address shows the not found page
    When user opens an address that does not exist
    Then the not found page is shown

  @navigation @ui_only
  Scenario: Client list can be filtered and switched to inactive
    When user filters the client list by "Rod"
    Then the client list shows only "Rodová Petra" and "Rod Lukáš"
    When user switches the client list to inactive
    Then the client list shows only "Neaktivní Pavel"
