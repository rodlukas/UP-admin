Feature: Operations with groups

  Background: Prepared database and logged user
    Given the database with some clients, groups and courses
    And the logged user

  @add @groups
  Scenario Outline: Add valid group
    When user adds new group "<name>" for course "<course>" with clients "<member_full_name1>" and "<member_full_name2>"
    Then the group is added

    Examples: Groups
      | name      | course       | member_full_name1 | member_full_name2 |
      | Slabika 3 | Kurz Slabika |                   |                   |
      | Slabika 3 | Kurz Slabika | Rod Lukáš         | Uhlíř Jaroslav    |

  @add @groups
  Scenario Outline: Add invalid group
    When user adds new group "<name>" for course "<course>" with clients "<member_full_name1>" and "<member_full_name2>"
    Then the group is not added

    Examples: Groups
      | name      | course       | member_full_name1 | member_full_name2 |
      # chybi nazev skupiny
      |           | Kurz Slabika |                   |                   |
      # chybi kurz
      | Slabika 3 |              |                   |                   |
      # neexistujici kurz
      | Slabika 3 | blabla       |                   |                   |

  @edit @groups
  Scenario: Edit group that has members
    When user updates the data of group "Slabika 1" to name "Slabika 3", course "Předškolák s ADHD" and clients to "Rod Lukáš", "Uhlíř Jaroslav" and "Rodová Petra"
    Then the group is updated

  @edit @groups
  Scenario: Edit group that has no members
    When user updates the data of group "Slabika 2" to name "Slabika 3", course "Předškolák s ADHD" and clients to "Rod Lukáš", "Uhlíř Jaroslav" and "Rodová Petra"
    Then the group is updated

  @delete @groups
  Scenario: Delete group
    When user deletes the group "Slabika 1"
    Then the group is deleted
