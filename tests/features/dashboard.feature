Feature: Dashboard

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  @dashboard @ui_only @fast.row1.1
  Scenario: Add a lecture from the dashboard without a preset date
    When user adds a single lecture from the dashboard on "2018-05-10" at "11:00" for "Rod Lukáš" in course "Kurz Slabika" with duration "20"
    Then the single lecture is on the card of "Rod Lukáš"
