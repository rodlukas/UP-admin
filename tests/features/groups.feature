Feature: Operations with clients

  Background: Prepared database and logged user
    Given the database with some clients, groups and courses
    And the user is logged
"""
  Scenario: Add valid group
    When user adds new group "Slabika 3" for course "Kurz Slabika" with clients "Rod Lukáš" and "Uhlíř Jaroslav"
    Then the group is added
"""
