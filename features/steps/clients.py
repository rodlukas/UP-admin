from behave import given, when, then, step
from admin.models import Client
from up.settings import JWT_AUTH
import json
from django.contrib.auth import get_user_model
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By


@then('the client is in our database')
def step_impl(context):
    qs = Client.objects.filter(name=context.name, surname=context.surname)
    assert len(qs) == 1


@given("the database with some clients")
def step_impl(context):
    Client(name="Lukas", surname="Rod").save()
    Client(name="Aneta", surname="Jiruskova").save()
    assert Client.objects.count() > 0


@when('user adds new client through API')
def step_impl(context):
    context.name = "Josef"
    context.surname = "Voříšek"
    assert Client.objects.filter(name=context.name, surname=context.surname).count() == 0
    context.client.post('/api/v1/clients/', {'name': context.name, 'surname': context.surname}, format='json')


@when('user adds new client through frontend')
def step_impl(context):
    context.name = "Josef"
    context.surname = "Voříšek2"
    assert Client.objects.filter(name=context.name, surname=context.surname).count() == 0
    context.browser.implicitly_wait(5)
    context.browser.find_element_by_xpath("/html/body/div[1]/div/nav/div/ul/li[3]/a").click()
    context.browser.find_element_by_xpath("/html/body/div[1]/div/div[2]/div/div/h1/button").click()
    context.browser.find_element_by_id('name').send_keys(context.name)
    context.browser.find_element_by_id('surname').send_keys(context.surname)
    context.browser.find_element_by_id('surname').submit()


@step("the user is logged")
def step_impl(context):
    user = get_user_model()
    user.objects.create_user(
        username='test',
        email='testuser@test.cz',
        password='test'
    )
    response = context.client.post("/api/v1/jwt-auth/", {"username": "test", "password": "test"})
    token = json.loads(response.content)['token']
    assert response.status_code == 200
    jwt_token = JWT_AUTH['JWT_AUTH_HEADER_PREFIX'] + " " + token
    context.client.credentials(HTTP_AUTHORIZATION=jwt_token)


@step("the user is logged on frontend")
def step_impl(context):
    context.browser.get(context.base_url)
    user = get_user_model()
    user.objects.create_user(
        username='test',
        email='testuser@test.cz',
        password='test'
    )
    context.old_cnt = Client.objects.all().count()
    context.browser.find_element_by_id('username').send_keys('test')
    context.browser.find_element_by_id('password').send_keys('test')
    context.browser.find_element_by_id('password').submit()
    context.browser.implicitly_wait(5)
    dashboard = context.browser.find_elements_by_xpath("//*[text()='Dnešní přehled']")
    assert len(dashboard) == 1


def number_of_elements_to_be(loc, number):
    return len(loc) == number + 1


@step("the client is visible on frontend")
def step_impl(context):
    search_name = context.surname + " " + context.name
    # wait for new client addition
    wait = WebDriverWait(context.browser, 5)
    wait.until(expected_conditions.presence_of_element_located((
        By.XPATH, f"//table[@id='clients']/tbody/tr[{context.old_cnt + 1}]/td[1]/span/a/span")))
    clients = context.browser.find_elements_by_xpath(".//table[@id='clients']/tbody/tr")
    same_client_cnt = 0
    for client in clients:
        name = client.find_element_by_xpath("td[1]/span/a/span").text
        if name == search_name:
            same_client_cnt += 1
    assert same_client_cnt == 1
