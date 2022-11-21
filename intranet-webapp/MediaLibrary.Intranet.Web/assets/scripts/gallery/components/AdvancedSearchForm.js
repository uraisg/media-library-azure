import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const AdvancedSearchForm = ({ searchTerm, setSearchTerm, currentSearchTerm, setCurrentSearchTerm }) => {
  const [user, setUser] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");
  const [name, setName] = useState("");
  const [copyright, setCopyright] = useState("");
  const [tag, setTag] = useState("");

  const boldFontStyle = { fontWeight: "bold" };
  const subtitleFontStyle = { fontWeight: "100", fontSize: 12 };

  const handleSearchButtonClick = () => {
    var [newSearchTerm, keyList, valueList] = getValueFromSearch(currentSearchTerm);
    var newSearch = newSearchTerm;

    if (user.trim() != "") {
      newSearch += (' Author:"' + user.replaceAll('\"', "") + '"');
    }

    if (location.trim() != "") {
      newSearch += (' LocationName:"' + location.replaceAll('\"', "") + '"');
    }

    if (caption.trim() != "") {
      newSearch += (' Caption:"' + caption.replaceAll('\"', "") + '"');
    }

    if (name.trim() != "") {
      newSearch += (' Project:"' + name.replaceAll('\"', "") + '"');
    }

    if (copyright.trim() != "") {
      newSearch += (' Copyright:"' + copyright.replaceAll('\"', "") + '"');
    }

    if (tag.trim() != "") {
      newSearch += (' Tag:"' + tag.replaceAll('\"', "") + '"');
    }

    setCurrentSearchTerm(newSearch);
    setSearchTerm(newSearch);
  };

  const handleInputKeyDown = (e) => {
    // If the user pressed the Enter key
    if (e.which === 13 || e.keyCode === 13) {
      // Trigger callback function from props
      handleSearchButtonClick();
    }
  }

  function getValueFromSearch(searchTerm) {
    var newSearchTerm = "";
    var keyList = [];
    var valueList = [];
    var foundIndexes = [];

    try {
      for (var i = searchTerm.indexOf('\"'); i > -1; i = searchTerm.indexOf('\"', i + 1)) {
        foundIndexes.push(i);
      }

      var originalSearch = searchTerm;
      if (foundIndexes.length == 0) {
        newSearchTerm = originalSearch;
      }
      else {
        for (var i = 0; i < foundIndexes.length; i++) {
          var indexOfChar = originalSearch.indexOf("\"");

          var left = originalSearch.substring(0, indexOfChar);
          var right = originalSearch.substring(indexOfChar);

          if (i % 2 != 0) {
            valueList.push(left.replaceAll("\"", ""));
          }
          else {
            var strList = left.split(" ");

            for (var p = 0; p < strList.length; p++) {
              if (strList[p].includes(":")) {
                keyList.push(strList[p].replaceAll(":", ""));
              }
              else {
                newSearchTerm += strList[p];
              }
            }
          }

          originalSearch = right.substring(1);
        }

        newSearchTerm += originalSearch;
      }
    }
    catch (err) {
      console.log("An error has occured while trying to display advanced search: " + err);
    }

    return [newSearchTerm, keyList, valueList];
  }

  useEffect(() => {
    var [newSearchTerm, keyList, valueList] = getValueFromSearch(currentSearchTerm);

    try {
      for (var i = 0; i < keyList.length; i++) {
        switch (keyList[i]) {
          case "Author":
            setUser(valueList[i]);
            break;
          case "LocationName":
            setLocation(valueList[i]);
            break;
          case "Caption":
            setCaption(valueList[i]);
            break;
          case "Project":
            setProject(valueList[i]);
            break;
          case "Copyright":
            setCopyright(valueList[i]);
            break;
          case "Tag":
            setTag(valueList[i]);
            break;
          default:
            break;
        }
      }
    }
    catch (err) {
      console.log("An error occured while trying to add values to advanced search fields: " + err);
    }
  }, [searchTerm]);

  return (
    <Form>
      <div className="d-flex flex-row justify-content-around m-2">
        <div className="p-4">
          <Form.Group as={Row} className="mb-3 justify-content-between">
            <Form.Label column sm="2" style={boldFontStyle}>User</Form.Label>
            <Col sm="8">
              <Form.Control
                placeholder="Upload by user"
                value={user}
                onChange={e => setUser(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3 justify-content-between">
            <Form.Label column sm="2" style={boldFontStyle}>Location</Form.Label>
            <Col sm="8">
              <Form.Control
                placeholder="Location of image"
                value={location}
                onChange={e => setLocation(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3 justify-content-between">
            <Form.Label column sm="2" style={boldFontStyle}>Caption</Form.Label>
            <Col sm="8">
              <Form.Control
                placeholder="Caption of image"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
            </Col>
          </Form.Group>
        </div>

        <div className="p-4">
          <Form.Group as={Row} className="mb-3 justify-content-between">
            <Form.Label column sm="2" style={boldFontStyle}>Name</Form.Label>
            <Col sm="8">
              <Form.Control
                placeholder="Name of image"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3 justify-content-between">
            <Form.Label column sm="2" style={boldFontStyle}>Copyright</Form.Label>
            <Col sm="8">
              <Form.Control
                placeholder="Copyright"
                value={copyright}
                onChange={e => setCopyright(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3 justify-content-between">
            <Form.Label column sm="2" style={boldFontStyle}>Tags</Form.Label>
            <Col sm="8">
              <Form.Control
                placeholder="Tags"
                value={tag}
                onChange={e => setTag(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />

              <Form.Label style={subtitleFontStyle}>Tags are separated with a comma (,)</Form.Label>
            </Col>
          </Form.Group>
        </div>
      </div>

      <div className="d-flex justify-content-end m-2">
        <Button size="lg" onClick={handleSearchButtonClick}>Search</Button>
      </div>
    </Form>
  )
}

AdvancedSearchForm.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  currentSearchTerm: PropTypes.string,
  setCurrentSearchTerm: PropTypes.func,
}

export default AdvancedSearchForm
