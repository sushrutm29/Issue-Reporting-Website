import React, { Component, useContext, useState, useEffect } from "react";
import { Card, Modal, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../firebase/Auth';
import axios from 'axios';
import { doChangePassword } from '../firebase/FirebaseFunctions';
import ModalHeader from "react-bootstrap/ModalHeader";
import '../App.css';

/**
 * @author Sri Vallabhaneni
 * @version 1.0
 * @date 05/06/2020
 */

function UserProfile(){
    const { currentUser } = useContext(AuthContext);

    const [userData, setUserData] = useState(undefined);
    const [postsData, setPostsData] = useState(undefined);
    const [imageName, setImageName] = useState(undefined);
    const [imageFile, setImageFile] = useState({});

    // async function fetchData(){
    //     try {
    //         alert("user profile function effected!");
    //         const {data} = await axios.get(`http://localhost:3001/data/user/name/${currentUser.displayName}`);
    //         setUserData(data);
    //         const userId = data._id;
    //         const imageDetails = await axios.get(`http://localhost:3001/data/profilepic/${userId}`);
    //         alert(`imageDetails: ${JSON.stringify(imageDetails)}`);
    //         if (imageDetails) {
    //             setImageName(`./../../public/uploads/profilePic.png`);
    //         }
    //         else {
    //             setImageName(`./../../public/imgs/profilePic.png`);
    //         }
    //         // await getImageDetails(data);
    //         // await getUserPostDetails(data);
    //     } catch (error) {
    //         console.log("error : ", error);
    //     }
    // }

    useEffect(() => {
            const fetchData = async () => {
                try {
                    alert("user profile function effected!");
                    const {data} = await axios.get(`http://localhost:3001/data/user/name/${currentUser.displayName}`);
                    setUserData(data);
                    const userId = data._id;
                    const imageDetails = await axios.get(`http://localhost:3001/data/profilepic/${userId}`);
                    alert(`imageDetails: ${JSON.stringify(imageDetails)}`);
                    if (imageDetails) {
                        setImageName(`./../../public/uploads/profilePic.png`);
                    }
                    else {
                        setImageName(`./../../public/imgs/profilePic.png`);
                    }
                    // await getImageDetails(data);
                    // await getUserPostDetails(data);
                } catch (error) {
                    console.log("error : ", error);
                }
            }
            fetchData();
    }, []);

    const getImageDetails = async (user) => {
        try {
            const userId = user._id;
            const imageDetails = await axios.get(`http://localhost:3001/data/profilepic/${userId}`);
            alert(`imageDetails: ${JSON.stringify(imageDetails)}`);
            if (imageDetails) {
                setImageName(`./../../public/uploads/profilePic.png`);
            }
            else {
                setImageName(`./../../public/imgs/profilePic.png`);
            }

        } catch (error) {
            console.log(error);
        }
    }
        
    const handleFile = async (event) => {
        setImageFile(event.target.files[0]);
    }

    const handleUpload = async (event) => {
        event.preventDefault();
        try {
            if (imageFile !== null) {
                try {
                    await axios.delete(`http://localhost:3001/data/profilepic/${userData._id}`);
                } catch (error) {
                    console.log(error);
                }
                let formData = new FormData();
                formData.append('image', imageFile);
                await axios.post('http://localhost:3001/data/profilepic', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                await axios.post(`http://localhost:3001/data/profilepic/${userData._id}`);
                await getImageDetails();
            }else{
                alert("Please choose an image to upload!");
            }
        }
        catch (error) {
            console.log(error)
        }

    }

    // onImageChange = (event) => {
    //     console.log("onImageChange")
    //     if (event.target.files && event.target.files[0]) {
    //       let reader = new FileReader();
    //       reader.onload = (e) => {
    //         this.setState({imageFile : e.target.result});
    //       };
    //       console.log(this.state.imageFile);
    //       reader.readAsDataURL(event.target.files[0]);
    //     }
    //   }

    

    const handleSubmit = async (event) => {
        event.preventDefault();
        const title = event.target.postTitle.value;
        const body = event.target.postBody.value;
        const id = event.target.postID.value;
        const postDetails = {
            title,
            body
        }
        try {
            await axios({
                method: 'patch',
                url: `http://localhost:3001/data/post/update/${id}`,
                data: postDetails
            });
        } catch (error) {
            console.log(error);
        }
    }

    const changePassword = async (event) => {
        event.preventDefault();
        const oldpwd = event.target.oldpassword.value;
        const newpwd = event.target.newpassword.value;
        const email = userData.userEmail;
        if (newpwd.length != 0 && oldpwd.length != 0) {
            await doChangePassword(email, oldpwd, newpwd);
        }
        alert("Password Successfully Changed! Please Login back! ");
        return <Redirect to="/login" />;
    }

    const openEditForm = (openClassName, closeClassName) => {
        var divToOpen = document.getElementsByClassName(openClassName);
        var divToClose = document.getElementsByClassName(closeClassName);

        for (var i = 0; i < divToOpen.length; i++) {
            divToOpen[i].style.display = "block";
        }

        for (var i = 0; i < divToClose.length; i++) {
            divToClose[i].style.display = "none";
        }
    }

    const getUserPostDetails = async (user) => {
        try {
            if (user !== null) {
                // console.log(this.state.idofuser);
                let postIds = user.posts;
                let posts = [];
                // for (const id of postIds) {
                //     let post = await axios.get(`http://localhost:3001/data/post/${id}`);
                //     posts.push(post.data)
                // }
                setPostsData(posts);
            }
            else {
                return <Redirect to="/login" />;
            }
        } catch (error) {
            console.log(error)
        }
    }

    return( 
            <div>
                <br></br>
                <br></br>
                <div className="profile-img-div">
                    <img src = {imageName} alt="image not found" />
                </div>
                <br></br>
                <br></br>
                <form onSubmit={handleUpload}>
                    <h6> Change Profile Picture : </h6>
                    <br></br>
                    <input type="file" variant="primary" onChange={handleFile} />
                    <Button type="submit" variant="primary"> Change Profile Picture </Button>
                </form>
                <br></br>
                <Card style={{ margin: "0px auto", width: "500px" }}>

                    <h1>{(userData && userData.userName) || " No Username available Here  "}</h1>
                    <br></br>
                    <h3> {(userData && userData.userEmail) || " No User email available Here  "}</h3>
                </Card>

                <div className="change-password-wrapper" style={{ margin: "0px auto", width: "250px" }}>
                    <br></br>
                    <div>
                        <h6>Change Password</h6>
                    </div>
                    <hr></hr>
                    <br></br>
                    <form onSubmit={changePassword}>
                        <div className="form-group">
                            <div>
                                <input type="password" className="form-control" name="oldpassword" placeholder="old password"></input>
                            </div>
                            <br></br>
                            <div>
                                <input type="password" className="form-control" name="newpassword" placeholder="new password"></input>
                            </div>
                            <br></br>
                            <div>
                                <Button type="submit" variant="primary"> Change Password </Button>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <h4>Posts</h4>
                    <hr></hr>
                </div>
                <div className="post-wrapper row">
                    {postsData && postsData.map((post, index) => (
                        <Modal.Dialog key={index} className="col-md-6 col-sm-6 col-lg-6 col-xs-6">
                            <br></br>
                            <form onSubmit={handleSubmit}>
                                <div className={index + "-edit edit-post-div"} style={{ display: "none" }}>
                                    <br></br>
                                    <label>Post Title  :  </label>
                                    <input type='text' placeholder='post-title' name='postTitle' defaultValue={post.title} />
                                    <br></br>
                                    <input type='text' name='postID' hidden value={post._id} readOnly />
                                    <br></br>
                                    <label>Post Body  : </label>
                                    <input type='text' placeholder='post-body' name='postBody' defaultValue={post.body} />
                                    <br></br>
                                    <br></br>
                                    <Modal.Footer>
                                        <button type="submit" variant="primary"> Save changes</button>
                                    </Modal.Footer>
                                </div>
                                <div className={index + "-show"}>
                                    <ModalHeader>
                                        <div>Post Title : {post.title}</div>
                                    </ModalHeader>
                                    <br></br>
                                    <div>Post Body  : {post.body}</div>
                                    <br></br>

                                    <Button variant="secondary" showedit={index + "-edit"} onClick={() => openEditForm(index + "-edit", index + "-show")} > Edit</Button>

                                </div>
                            </form >
                            <br></br>
                        </Modal.Dialog>
                    ))}

                </div>

            </div>
    );
}

export default UserProfile;