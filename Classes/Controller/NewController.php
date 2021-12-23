<?php
namespace Slub\MahuFrontend\Controller;

class NewController extends \In2code\Femanager\Controller\NewController
{

    /**
     * Initialize create action for setting the right custom data type for the user.
     */
    public function initializeCreateAction() {
        if ($this->arguments->hasArgument('user')) {
            // Workaround to avoid php7 warnings of wrong type hint.
            /** @var \Slub\MahuFrontend\Xclass\Extbase\Mvc\Controller\Argument $user */
            $user = $this->arguments['user'];
            $user->setDataType(\Slub\MahuFrontend\Domain\Model\User\User::class);
        }
    }
    
    /**
     * action create
     *
     * @param \Slub\MahuFrontend\Domain\Model\User\User $user
     * @TYPO3\CMS\Extbase\Annotation\Validate("In2code\Femanager\Domain\Validator\ServersideValidator", param="user")
     * @TYPO3\CMS\Extbase\Annotation\Validate("In2code\Femanager\Domain\Validator\PasswordValidator", param="user")
     * @return void
     */
    public function createAction(\In2code\Femanager\Domain\Model\User $user)
    {
        parent::createAction($user);
    }
}