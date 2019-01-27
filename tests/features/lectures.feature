Feature: Operations with lectures

  Background: Prepared database and logged user
    Given the database with some clients, groups and courses
    And the logged user

  @add @lectures
  Scenario Outline: Add valid single lecture
    When user adds new single lecture for client "<client>" for course "<course>" with date "<date>", time "<time>", canceled "<canceled>", attendance state "<attendancestate>", paid "<paid>", note "<note>" and duration "<duration>"
    Then the lecture is added

    Examples: Lectures
      | client    | date       | time  | canceled | course       | attendancestate | paid  | note | duration |
      | Lukáš Rod | 2018-05-07 | 15:00 | False    | Kurz Slabika | OK              | True  |      | 50       |
      | Lukáš Rod | 2018-05-07 | 16:00 | False    | Kurz Slabika | omluven         | False | test | 40       |
      | Lukáš Rod | 2018-05-07 | 17:00 | False    | Kurz Slabika | OK              | False | test | 10       |

  @add @lectures
  Scenario Outline: Add invalid lecture
    When user adds new lecture "<name>" for course "<course>" with clients "<member_full_name1>" and "<member_full_name2>"
    Then the lecture is not added

    Examples: Lectures
      | name      | course           | member_full_name1 | member_full_name2 |
      # chybi nazev skupiny
      |           | Kurz Slabika     |                   |                   |
      # chybi kurz
      | Slabika 3 |                  |                   |                   |
      # neexistujici kurz
      | Slabika 3 | blabla           |                   |                   |
      # skryty kurz
      | Slabika 3 | Máme doma leváka |                   |                   |
      # duplicitni nazev skupiny
      | Slabika 1 | Máme doma leváka |                   |                   |

  @edit @lectures
  Scenario: Edit lecture that has members
    When user updates the data of lecture "Slabika 1" to name "Slabika 3", course "Předškolák s ADHD" and clients to "Rod Lukáš", "Uhlíř Jaroslav" and "Rodová Petra"
    Then the lecture is updated

  @edit @lectures
  Scenario: Edit lecture that has no members
    When user updates the data of lecture "Slabika 2" to name "Slabika 3", course "Předškolák s ADHD" and clients to "Rod Lukáš", "Uhlíř Jaroslav" and "Rodová Petra"
    Then the lecture is updated

  @delete @lectures
  Scenario: Delete lecture
    When user deletes the lecture "Slabika 1"
    Then the lecture is deleted
