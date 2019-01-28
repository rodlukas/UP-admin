Feature: Operations with lectures

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user


  @add @lectures
  Scenario Outline: Add valid group lecture
    When user adds new group lecture for group "<group>" with date "<date>", time "<time>", duration "<duration>", canceled "<canceled>", attendance of the client "<client1>" is: "<attendancestate1>", paid "<paid1>", note "<note1>" and attendance of the client "<client2>" is: "<attendancestate2>", paid "<paid2>", note "<note2>"
    Then the lecture is added

    Examples: Lectures
      | group     | date       | time  | canceled | duration | client1      | attendancestate1 | paid1 | note1 | client2         | attendancestate2 | paid2 | note2 |
      | Slabika 4 | 2018-05-07 | 15:00 | False    | 50       | Rodová Petra | OK               | True  |       | Jirušková Aneta | OK               | True  |       |
      | Slabika 4 | 2018-05-07 | 16:00 | False    | 40       | Rodová Petra | omluven          | False | test  | Jirušková Aneta | omluven          | False | test  |
      | Slabika 4 | 2018-05-07 | 17:00 | False    | 10       | Rodová Petra | OK               | False | test  | Jirušková Aneta | OK               | False | test  |


  @add @lectures
  Scenario Outline: Add valid single lecture
    When user adds new single lecture for client "<client>" for course "<course>" with date "<date>", time "<time>", duration "<duration>", canceled "<canceled>", attendance of the client is: "<attendancestate>", paid "<paid>", note "<note>"
    Then the lecture is added

    Examples: Lectures
      | client    | date       | time  | canceled | course       | attendancestate | paid  | note | duration |
      | Rod Lukáš | 2018-05-07 | 15:00 | False    | Kurz Slabika | OK              | True  |      | 50       |
      | Rod Lukáš | 2018-05-07 | 16:00 | False    | Kurz Slabika | omluven         | False | test | 40       |
      | Rod Lukáš | 2018-05-07 | 17:00 | False    | Kurz Slabika | OK              | False | test | 10       |


  @add @lectures
  Scenario Outline: Add invalid group lecture
    When user adds new group lecture for group "<group>" with date "<date>", time "<time>", duration "<duration>", canceled "<canceled>", attendance of the client "<client1>" is: "<attendancestate1>", paid "<paid1>", note "<note1>" and attendance of the client "<client2>" is: "<attendancestate2>", paid "<paid2>", note "<note2>"
    Then the lecture is not added

    Examples: Lectures
      | group     | date       | time  | canceled | duration | client1      | attendancestate1 | paid1 | note1 | client2         | attendancestate2 | paid2 | note2 |
      # chybi trvani
      | Slabika 4 | 2018-05-07 | 15:00 | False    |          | Rodová Petra | OK               | True  |       | Jirušková Aneta | OK               | True  |       |
      # casovy konflikt
      | Slabika 4 | 2018-05-07 | 20:00 | False    | 10       | Rodová Petra | OK               | False | test  | Jirušková Aneta | OK               | False | test  |


  @add @lectures
  Scenario Outline: Add invalid single lecture
    When user adds new single lecture for client "<client>" for course "<course>" with date "<date>", time "<time>", duration "<duration>", canceled "<canceled>", attendance of the client is: "<attendancestate>", paid "<paid>", note "<note>"
    Then the lecture is not added

    Examples: Lectures
      | client    | date       | time  | canceled | course       | attendancestate | paid  | note | duration |
      # chybi trvani
      | Rod Lukáš | 2018-05-07 | 16:00 | False    | Kurz Slabika | omluven         | False | test |          |
      # casovy konflikt
      | Rod Lukáš | 2018-05-07 | 20:00 | False    | Kurz Slabika | omluven         | False | test | 40       |


  @edit @lectures
  Scenario: Edit single lecture
    When user updates the data of lecture at "2018-05-07", "20:00" to date "2018-05-08", time "21:00", course "Předškolák s ADHD", duration "88", canceled "True", attendance of the client "Rodová Petra" is: "OK", paid "False", note "test"
    Then the lecture is updated

  @delete @lectures
  Scenario: Delete lecture
    When user deletes the lecture of the client "Rodová Petra" at "2018-05-07", "20:00"
    Then the lecture is deleted
