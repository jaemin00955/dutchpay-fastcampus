import { useRecoilState } from "recoil";
import { Button, Container, Form, Row } from "react-bootstrap";
import { groupNameState } from "../state/groupName";
import { useState } from "react";

export const CreateGroup = () => {
  const [validated, setValidated] = useState(false);
  const [validGroupName, setValidGroupName] = useState(false);
  const [groupName, setGroupName] = useRecoilState(groupNameState);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      setValidGroupName(true);
    } else {
      event.stopPropagation();
      setValidGroupName(false);
    }
    setValidated(true);
  };
  return (
    <div>
      <h1>Dutch Pay</h1>
      <Container>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <h2>먼저 더치페이 할 그룹의 이름을 정해볼까요?</h2>
          </Row>
          <Row>
            <Form.Group controlId="validationGroupName">
              <Form.Control
                type="text"
                required
                placeholder="2022 제주도 여행"
                onChange={(event) => {
                  setGroupName(event.targ);
                }}
              ></Form.Control>
              <Form.Control.Feedback type="invalid" data-valid={validGroupName}>
                그룹 이름을 입력해 주세요.
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
          <Row>
            <Button type="submit">저장</Button>
          </Row>
        </Form>
      </Container>
      {/* <CenteredOverlayForm /> */}
    </div>
  );
};
